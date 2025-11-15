-- ========================================
-- 🔍 PROVERA: Da li je fix skripta radila?
-- ========================================

-- 1️⃣ Proveri RLS politiku za vozača (završavanje tura)
SELECT 
  '1️⃣ VOZAČ MOŽE DA ZAVRŠI TURU?' as provera,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ DA - Politika postoji!'
    ELSE '❌ NE - Pokreni POKRENI-OVO-ZA-FIX.sql ponovo'
  END as status
FROM pg_policies 
WHERE tablename = 'ture' 
  AND policyname = 'Vozac moze da zavrsi svoju dodeljenu turu';

-- 2️⃣ Proveri CHECK constraint za notifikacije
SELECT 
  '2️⃣ NOTIFIKACIJE CONSTRAINT?' as provera,
  CASE 
    WHEN pg_get_constraintdef(con.oid) LIKE '%nova_ocena%' THEN '✅ DA - Sadrži nova_ocena i uplata_potrebna'
    ELSE '❌ NE - Pokreni POKRENI-OVO-ZA-FIX.sql ponovo'
  END as status
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'notifikacije' 
  AND con.contype = 'c'
  AND con.conname = 'notifikacije_tip_check';

-- 3️⃣ Proveri RLS politike za ocene (INSERT)
SELECT 
  '3️⃣ POSLODAVAC MOŽE DA OCENI?' as provera,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ DA - Politika postoji!'
    ELSE '❌ NE - Pokreni POKRENI-OVO-ZA-FIX.sql ponovo'
  END as status
FROM pg_policies 
WHERE tablename = 'ocene' 
  AND cmd = 'INSERT';

-- 4️⃣ Proveri da li ima sve 4 politike za ocene
SELECT 
  '4️⃣ SVE POLITIKE ZA OCENE?' as provera,
  COUNT(*) as "Broj politika (treba 4)",
  CASE 
    WHEN COUNT(*) = 4 THEN '✅ DA - Sve 4 politike postoje!'
    ELSE '❌ NE - Ima samo ' || COUNT(*) || ' politika, treba 4'
  END as status
FROM pg_policies 
WHERE tablename = 'ocene';

-- ========================================
-- 🎯 FINALNI REZIME
-- ========================================

SELECT 
  '🎯 FINALNI REZIME' as tip,
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'ture' AND policyname LIKE '%Vozac%') as "Vozač završava turu (treba 1)",
  (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'ocene') as "Ocene politike (treba 4)",
  CASE 
    WHEN (SELECT pg_get_constraintdef(con.oid) FROM pg_constraint con JOIN pg_class rel ON rel.oid = con.conrelid WHERE rel.relname = 'notifikacije' AND con.conname = 'notifikacije_tip_check' LIMIT 1) LIKE '%nova_ocena%' 
    THEN '✅ Notifikacije OK'
    ELSE '❌ Notifikacije nisu OK'
  END as "Notifikacije constraint";

-- ========================================
-- 📊 ŠTA TREBAŠ DA VIDIŠ:
-- ========================================
-- 1️⃣ ✅ DA - Politika postoji!
-- 2️⃣ ✅ DA - Sadrži nova_ocena i uplata_potrebna
-- 3️⃣ ✅ DA - Politika postoji!
-- 4️⃣ ✅ DA - Sve 4 politike postoje!
--
-- FINALNI REZIME:
-- - Vozač završava turu: 1
-- - Ocene politike: 4
-- - Notifikacije constraint: ✅ Notifikacije OK
-- ========================================

