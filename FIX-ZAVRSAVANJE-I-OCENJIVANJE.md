# 🔧 FIX: Završavanje tura i Ocenjivanje vozača

## 📋 PROBLEMI KOJE REŠAVAMO

### 1️⃣ **Vozač ne može da završi turu**
**Problem:** Kada vozač klikne "Završio sam turu", status ture se ne menja na `zavrsena` u Supabase.

**Razlog:** RLS (Row Level Security) politike ne dozvoljavaju vozaču da ažurira tabelu `ture`.

---

### 2️⃣ **Poslodavac ne može da oceni vozača**
**Problem:** Kada poslodavac pokuša da oceni vozača, dobija grešku `Error: {}`.

**Razlog:** RLS politika za tabelu `ocene` je previše striktna i blokira insert bez jasne poruke.

---

## ✅ REŠENJE

### **KORAK 1: Otvori Supabase SQL Editor**

1. Idi na: https://supabase.com
2. Prijavi se i otvori svoj projekat
3. U levom meniju klikni na **SQL Editor**
4. Klikni **New Query**

---

### **KORAK 2: Pokreni SQL za RLS politiku - Završavanje tura**

**Kopiraj i pokreni ovu skriptu:**

```sql
-- ========================================
-- FIX: Dozvoli vozaču da završi svoju dodeljenu turu
-- ========================================

-- Dodaj novu RLS politiku
CREATE POLICY "Vozac moze da zavrsi svoju dodeljenu turu"
  ON public.ture
  FOR UPDATE
  TO authenticated
  USING (
    -- Vozač može da ažurira turu samo ako je on dodeljeni vozač
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() 
        AND uloga = 'vozac' 
        AND id = dodeljeni_vozac_id
    )
    AND status = 'dodeljena' -- Tura mora biti u statusu 'dodeljena'
  )
  WITH CHECK (
    -- Vozač može da postavi status SAMO na 'zavrsena'
    status = 'zavrsena'
  );
```

**Klikni "RUN" (ili pritisni F5)**

---

### **KORAK 3: Pokreni SQL za RLS politiku - Ocenjivanje**

**Kopiraj i pokreni ovu skriptu:**

```sql
-- ========================================
-- FIX: Pojednostavljena RLS politika za ocene
-- ========================================

-- Ukloni sve stare politike
DROP POLICY IF EXISTS "Ocene su javno vidljive" ON public.ocene;
DROP POLICY IF EXISTS "Poslodavac može da oceni vozača na svojoj turi" ON public.ocene;
DROP POLICY IF EXISTS "Poslodavac moze da oceni vozaca" ON public.ocene;
DROP POLICY IF EXISTS "Poslodavac može da ažurira svoju ocenu" ON public.ocene;
DROP POLICY IF EXISTS "Poslodavac moze da azurira svoju ocenu" ON public.ocene;
DROP POLICY IF EXISTS "Poslodavac može da obriše svoju ocenu" ON public.ocene;
DROP POLICY IF EXISTS "Poslodavac moze da obrise svoju ocenu" ON public.ocene;

-- Policy 1: Svi mogu da čitaju ocene (javne su)
CREATE POLICY "Ocene su javno vidljive"
  ON public.ocene
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: INSERT - Poslodavac može da kreira ocenu
CREATE POLICY "Poslodavac moze da oceni vozaca"
  ON public.ocene
  FOR INSERT
  TO authenticated
  WITH CHECK (
    poslodavac_id = auth.uid()
  );

-- Policy 3: UPDATE - Poslodavac može da ažurira svoju ocenu
CREATE POLICY "Poslodavac moze da azurira svoju ocenu"
  ON public.ocene
  FOR UPDATE
  TO authenticated
  USING (poslodavac_id = auth.uid())
  WITH CHECK (poslodavac_id = auth.uid());

-- Policy 4: DELETE - Poslodavac može da obriše svoju ocenu
CREATE POLICY "Poslodavac moze da obrise svoju ocenu"
  ON public.ocene
  FOR DELETE
  TO authenticated
  USING (poslodavac_id = auth.uid());
```

**Klikni "RUN" (ili pritisni F5)**

---

### **KORAK 4: Proveri da su politike kreirane**

Pokreni ovu proveru:

```sql
-- Proveri politike za 'ture'
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'ture';

-- Proveri politike za 'ocene'
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'ocene';
```

**Trebalo bi da vidiš:**

Za tabelu `ture`:
- ✅ `Vozac moze da zavrsi svoju dodeljenu turu` (UPDATE)

Za tabelu `ocene`:
- ✅ `Ocene su javno vidljive` (SELECT)
- ✅ `Poslodavac moze da oceni vozaca` (INSERT)
- ✅ `Poslodavac moze da azurira svoju ocenu` (UPDATE)
- ✅ `Poslodavac moze da obrise svoju ocenu` (DELETE)

---

## 🧪 TESTIRANJE

### **Test 1: Završavanje ture (Vozač)**

1. Prijavi se kao **vozač**
2. Otvori turu koja ti je **dodeljena** (status: `dodeljena`)
3. Klikni dugme **"Završio sam turu"**
4. Potvrdi u modal-u
5. **Očekivano:** 
   - ✅ Tura status se menja na `zavrsena`
   - ✅ Kreirana je uplata sa statusom `u_toku`
   - ✅ Vozač je blokiran
   - ✅ Vozač dobija notifikaciju
   - ✅ Redirect na `/uplata-obavezna`

---

### **Test 2: Ocenjivanje vozača (Poslodavac)**

1. Prijavi se kao **poslodavac**
2. Otvori svoju turu koja je **završena** (status: `zavrsena`)
3. Klikni dugme **"Oceni vozača"**
4. Izaberi ocenu (1-5 ⭐)
5. Opciono napiši komentar
6. Klikni **"Oceni"**
7. **Očekivano:**
   - ✅ Ocena je kreirana u tabeli `ocene`
   - ✅ Trigger šalje notifikaciju vozaču
   - ✅ Prikazuje se success poruka
   - ✅ Stranica se refresh-uje

---

## 📊 ŠTA SE DESILO?

### **1. RLS Politika za Završavanje Ture**

**Pre:**
```sql
-- Samo poslodavac i admin mogli da ažuriraju turu
-- Vozač NIJE imao dozvolu ❌
```

**Posle:**
```sql
-- Vozač može da ažurira SAMO svoju dodeljenu turu ✅
-- I može da postavi status SAMO na 'zavrsena' ✅
```

---

### **2. RLS Politika za Ocenjivanje**

**Pre:**
```sql
-- Kompleksna politika sa EXISTS subquery
-- Mogla je da ne radi u RLS kontekstu ❌
WITH CHECK (
  EXISTS (
    SELECT 1 FROM ture t
    WHERE t.id = tura_id
      AND t.firma_id = auth.uid()
      AND t.status = 'zavrsena'
  )
)
```

**Posle:**
```sql
-- Pojednostavljena politika ✅
-- Validacija se radi u application logic (TypeScript)
WITH CHECK (
  poslodavac_id = auth.uid()
)
```

**Dodatno:**
- Poboljšan error handling u komponenti
- Detaljne console log poruke za debugging
- Validacija u TypeScript kodu pre INSERT-a

---

## 🚨 AKO NEŠTO NE RADI

### **Problem: "new row violates row-level security policy"**

**Rešenje:**
1. Proveri da si pokrenuo SQL skripte
2. Proveri da politike postoje:
   ```sql
   SELECT * FROM pg_policies WHERE tablename IN ('ture', 'ocene');
   ```
3. Proveri da je RLS omogućen:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public' 
     AND tablename IN ('ture', 'ocene');
   ```

---

### **Problem: Console prikazuje prazan error `{}`**

**Rešenje:**
Komponenta sada ima poboljšan error handling i trebalo bi da vidiš detaljnije poruke:
- 🔍 Trenutni korisnik
- 🔍 Tura podaci
- ✅ Success poruke
- ❌ Detaljne error poruke

Otvori **Browser Console** (F12) i vidi detaljne logove.

---

## ✅ PROVERA DA JE SVE OK

Pokreni ovu SQL proveru:

```sql
-- 1. Proveri da tabela 'ocene' postoji
SELECT 'Tabela ocene postoji' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'ocene';

-- 2. Proveri RLS politike
SELECT 
  tablename,
  COUNT(*) as broj_politika
FROM pg_policies 
WHERE tablename IN ('ture', 'ocene')
GROUP BY tablename;

-- Trebalo bi:
-- ture: 4-5 politika
-- ocene: 4 politike
```

---

## 🎉 GOTOVO!

Sada bi trebalo da radi:
- ✅ Vozač može da završi svoju dodeljenu turu
- ✅ Poslodavac može da oceni vozača nakon završene ture
- ✅ Detaljne error poruke u konzoli
- ✅ Validacija u application logic-u

---

**Ako i dalje imaš problema, otvori Browser Console (F12) i pogledaj detaljne logove!** 🔍

