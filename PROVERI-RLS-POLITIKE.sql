-- ========================================
-- 🔍 PROVERA RLS POLITIKA
-- ========================================
-- Pokreni ovu skriptu da proveriš da li su RLS politike postavljene
-- ========================================

-- 1. Proveri da li tabela 'ocene' postoji
SELECT 
  '✅ Tabela ocene postoji' as status,
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'ocene';

-- 2. Proveri da li je RLS omogućen za tabelu 'ocene'
SELECT 
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS je omogućen za tabelu ocene'
    ELSE '❌ RLS NIJE omogućen za tabelu ocene!'
  END as status,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'ocene';

-- 3. Izlistaj SVE RLS politike za tabelu 'ocene'
SELECT 
  '📋 RLS Politike za tabelu ocene:' as naslov,
  policyname as "Naziv Politike",
  cmd as "Komanda (SELECT/INSERT/UPDATE/DELETE)",
  permissive as "Dozvoljava",
  roles as "Uloge"
FROM pg_policies 
WHERE tablename = 'ocene'
ORDER BY cmd, policyname;

-- 4. Detaljne informacije o INSERT politici
SELECT 
  '🔍 Detalji INSERT politike:' as naslov,
  policyname as "Naziv",
  qual as "USING uslovi",
  with_check as "WITH CHECK uslovi"
FROM pg_policies 
WHERE tablename = 'ocene' 
  AND cmd = 'INSERT';

-- ========================================
-- ŠTA TREBAŠ DA VIDIŠ:
-- ========================================
-- 
-- Za korak 3, trebalo bi da vidiš 4 politike:
--
-- 1. "Ocene su javno vidljive" (SELECT)
-- 2. "Poslodavac moze da oceni vozaca" (INSERT)
-- 3. "Poslodavac moze da azurira svoju ocenu" (UPDATE)
-- 4. "Poslodavac moze da obrise svoju ocenu" (DELETE)
--
-- ========================================
-- AKO NE VIDIŠ 4 POLITIKE:
-- ========================================
-- Pokreni skriptu: POKRENI-OVO-ZA-FIX.sql
-- ========================================

-- 5. Proveri RLS politike za tabelu 'ture' (za završavanje tura)
SELECT 
  '📋 RLS Politike za tabelu ture:' as naslov,
  policyname as "Naziv Politike",
  cmd as "Komanda",
  permissive as "Dozvoljava"
FROM pg_policies 
WHERE tablename = 'ture'
ORDER BY cmd, policyname;

-- ========================================
-- ŠTA TREBAŠ DA VIDIŠ ZA TURE:
-- ========================================
-- Među politikama treba da postoji:
-- "Vozac moze da zavrsi svoju dodeljenu turu" (UPDATE)
-- ========================================

-- 6. Proveri CHECK constraint za notifikacije
SELECT 
  '🔍 CHECK Constraint za notifikacije:' as naslov,
  con.conname as "Constraint Name",
  pg_get_constraintdef(con.oid) as "Definition"
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'notifikacije' 
  AND con.contype = 'c'
  AND con.conname = 'notifikacije_tip_check';

-- ========================================
-- ŠTA TREBAŠ DA VIDIŠ:
-- ========================================
-- Definition treba da sadrži sve tipove:
-- CHECK (tip = ANY (ARRAY['odobreno', 'odbijeno', 'nova_ocena', 'uplata_potrebna']))
-- 
-- AKO NE VIDIŠ 'nova_ocena' i 'uplata_potrebna':
-- Pokreni skriptu: POKRENI-OVO-ZA-FIX.sql
-- ========================================

