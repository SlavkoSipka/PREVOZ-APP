# 🐛 DEBUG: Ocenjivanje Vozača

## Česta Greška: `Error: {}`

Ova greška može biti zbog nekoliko razloga:

### 1. ✅ FIXED: `.single()` Error
**Problem:** Korišćenje `.single()` kada ocena ne postoji vraća error.  
**Rešenje:** Koristi `.maybeSingle()` umesto `.single()`

```typescript
// ❌ Loše
.single()

// ✅ Dobro
.maybeSingle()
```

**Lokacija:** `app/poslodavac/ture/[id]/page.tsx`  
**Status:** ✅ Popravljeno

---

### 2. RLS Policy Problem

**Simptomi:**
- Console pokazuje `Error: {}`
- Toast poruka: "Došlo je do greške"

**Provera u Supabase SQL Editor:**

```sql
-- Proveri da li policy postoji
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'ocene';
```

Treba da vidiš policy:
```
Poslodavac može da oceni vozača na svojoj turi | INSERT
```

**Ako ne postoji, pokreni:**
```sql
-- Iz fajla: supabase-fix-ocene-rls.sql
DROP POLICY IF EXISTS "Poslodavac može da oceni vozača na svojoj turi" ON public.ocene;

CREATE POLICY "Poslodavac može da oceni vozača na svojoj turi"
  ON public.ocene
  FOR INSERT
  TO authenticated
  WITH CHECK (
    poslodavac_id = auth.uid()
    AND
    EXISTS (
      SELECT 1 FROM ture t
      WHERE t.id = tura_id
        AND t.firma_id = auth.uid()
        AND t.status = 'zavrsena'
        AND t.dodeljeni_vozac_id = vozac_id
    )
  );
```

---

### 3. Provera Console Log-ova

Otvori **Browser Console** (F12) i proveri:

**Kada klikneš "Oceni":**
```
Kreiram novu ocenu: {
  tura_id: "uuid...",
  vozac_id: "uuid...",
  poslodavac_id: "uuid...",
  ocena: 5,
  komentar: "..."
}

Insert result: {
  data: [...] ili null,
  error: null ili {...}
}
```

**Ako vidiš `error: {...}`:**
- Kopiraj ceo error objekat
- Proveri `error.message` ili `error.details`

---

### 4. Manuelna Provera u Supabase

**U Supabase Dashboard → Table Editor → ocene:**

1. Pokušaj da **MANUELNO** insertujеš red:
   ```
   tura_id: [UUID završene ture]
   vozac_id: [UUID vozača]
   poslodavac_id: [Tvoj UUID]
   ocena: 5
   komentar: "test"
   ```

2. **Ako dobiješ error:**
   - Proveri RLS policies
   - Proveri da li je tura `status = 'zavrsena'`
   - Proveri da li je `firma_id` ture === tvoj `poslodavac_id`

---

### 5. Provera Statusa Ture

**U Supabase SQL Editor:**

```sql
SELECT 
  t.id,
  t.status,
  t.firma_id,
  t.dodeljeni_vozac_id,
  u.email as poslodavac_email
FROM ture t
JOIN users u ON t.firma_id = u.id
WHERE t.id = 'TVOJ_TURA_ID';
```

**Proveri:**
- ✅ `status` mora biti `'zavrsena'`
- ✅ `dodeljeni_vozac_id` ne sme biti NULL
- ✅ `firma_id` mora biti tvoj ID

---

### 6. Provera Auth

**U Browser Console:**

```javascript
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user.id)
```

Proveri da li je taj ID === `firma_id` u turi.

---

## 🔧 Quick Fix Checklist

- [ ] Pokrenuo sam `supabase-fix-ocene-rls.sql`
- [ ] Zamenio sam `.single()` sa `.maybeSingle()` u `app/poslodavac/ture/[id]/page.tsx`
- [ ] Proverio sam da je tura u statusu `'zavrsena'`
- [ ] Proverio sam da `dodeljeni_vozac_id` nije NULL
- [ ] Proverio sam da je `firma_id` ture === moj user ID
- [ ] Restartovao sam dev server (`npm run dev`)

---

## 📊 Test Scenario

### Korak po Korak:

1. **Priprema:**
   - Loguj se kao POSLODAVAC
   - Idi na "Moje ture" → "Završene"
   - Otvori završenu turu

2. **Provera:**
   - Da li vidiš sekciju "Dodeljeni vozač"?
   - Da li vidiš dugme "Oceni vozača"?

3. **Klik na "Oceni vozača":**
   - Dialog se otvara ✅
   - Biraš 5 zvezdi ✅
   - Upisuješ komentar ✅

4. **Klik na "Oceni":**
   - Otvori Console (F12)
   - Proveri log-ove
   - Ako vidiš `Insert result: { data: [...], error: null }` → ✅ Uspešno!

5. **Provera Notifikacije:**
   - Loguj se kao VOZAČ
   - Proveri da li ima notifikaciju (🔔 ikona)

6. **Provera Profila:**
   - Idi na Profil vozača
   - Proveri da li se ocena prikazuje

---

## 🆘 Ako Ni Posle Svega Ne Radi

1. **Eksportuj podatke:**
   ```sql
   SELECT * FROM ture WHERE id = 'TURA_ID';
   SELECT * FROM users WHERE id = 'USER_ID';
   SELECT * FROM pg_policies WHERE tablename = 'ocene';
   ```

2. **Pošalji mi:**
   - Console error (ceo objekat)
   - Rezultate gornjih query-ja
   - Screenshot dialog-a

3. **Privremeno rešenje:**
   Onemogući RLS za testiranje:
   ```sql
   -- SAMO ZA TESTIRANJE!
   ALTER TABLE public.ocene DISABLE ROW LEVEL SECURITY;
   ```
   
   Ako radi → problem je definitivno u RLS policy.

---

**Autor:** AI Assistant  
**Updated:** 14. Novembar 2025

