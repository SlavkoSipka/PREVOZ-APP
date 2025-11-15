# 🔧 FIX: Greška Prilikom Ocenjivanja Vozača

## ❌ Problem

Kada poslodavac pokušava da oceni vozača, dobija grešku:
```
Error: {}
```

## ✅ Rešenja (2 Fixa)

### Fix 1: `.single()` Error (KRITIČNO)
Supabase `.single()` vraća error kada nema rezultata.

### Fix 2: RLS Policy Problem
Policy pokušava da pristupi kolonama koje se tek insertuju.

### Brza Popravka #1 - CODE FIX (OBAVEZNO!)

**File:** `app/poslodavac/ture/[id]/page.tsx`

Pronađi liniju sa `.single()` i zameni sa `.maybeSingle()`:

```typescript
// ❌ STARO (oko linija 50-58)
.single()

// ✅ NOVO
.maybeSingle()
```

**Cela promena:**
```typescript
const { data: postojecaOcena } = (jeMojaTura && tura.status === 'zavrsena' && tura.dodeljeni_vozac_id) 
  ? await supabase
      .from('ocene')
      .select('id, ocena, komentar')
      .eq('tura_id', params.id)
      .eq('vozac_id', tura.dodeljeni_vozac_id)
      .eq('poslodavac_id', userData.user.id)
      .maybeSingle() // ← Ovo promeni!
  : { data: null }
```

---

### Brza Popravka #2 - SQL FIX

1. **Otvori Supabase Dashboard**
2. **Idi na SQL Editor**
3. **Kopiraj i pokreni ovu skriptu:**

```sql
-- Ukloni staru policy
DROP POLICY IF EXISTS "Poslodavac može da oceni vozača na svojoj turi" ON public.ocene;

-- Kreiraj novu, ispravnu policy
CREATE POLICY "Poslodavac može da oceni vozača na svojoj turi"
  ON public.ocene
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Prvo proveri da li je poslodavac_id jednak trenutnom korisniku
    poslodavac_id = auth.uid()
    AND
    -- Zatim proveri da li postoji završena tura sa tim podacima
    EXISTS (
      SELECT 1 FROM ture t
      WHERE t.id = tura_id
        AND t.firma_id = auth.uid()
        AND t.status = 'zavrsena'
        AND t.dodeljeni_vozac_id = vozac_id
    )
  );
```

4. **Klikni RUN**
5. **Testiraj ponovo!**

---

## 🔍 Šta Je Bilo Pogrešno?

**Stara Policy:**
```sql
WHERE t.id = ocene.tura_id  -- ❌ POGREŠNO - ne može pristupiti ocene.kolona u WITH CHECK
```

**Nova Policy:**
```sql
WHERE t.id = tura_id  -- ✅ ISPRAVNO - direktno referencira kolonu koja se insertuje
```

---

## ✅ Provera

Nakon što pokreneš fix, proveri da policy postoji:

```sql
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'ocene';
```

Treba da vidiš:
- `Poslodavac može da oceni vozača na svojoj turi` - **cmd: INSERT**

---

## 🎯 Test

1. **Poslodavac** otvori završenu turu
2. Klikni **"Oceni vozača"**
3. Bira 5 zvezdi
4. Upiše komentar
5. Klikni **"Oceni"**
6. ✅ Treba da vidiš: **"Uspešno! Vozač je ocenjen."**

---

## 📄 Alternativa

Možeš i da pokreneš ceo fajl:
```bash
supabase-fix-ocene-rls.sql
```

---

**Problem rešen!** 🎉

