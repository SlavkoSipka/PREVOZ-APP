-- =====================================================
-- DIJAGNOSTIKA: Zašto poslodavac ne vidi notifikacije?
-- =====================================================

-- **KORAK 1:** Proveri da li notifikacije postoje u bazi
SELECT 
  id,
  vozac_id,
  tip,
  poruka,
  procitano,
  created_at
FROM notifikacije
WHERE vozac_id = 'POSLODAVAC-ID-OVDE'  -- ⚠️ Zameni sa pravim ID-om!
ORDER BY created_at DESC;

-- Ako vidiš notifikacije ovde, znači da su u bazi ✅
-- Ako ne vidiš notifikacije, znači da INSERT nije uspeo ❌

-- =====================================================
-- **KORAK 2:** Proveri RLS politike za notifikacije
-- =====================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'notifikacije';

-- Traži politike koje imaju:
-- ❌ BAD: "users.uloga = 'vozac'" - ovo blokira poslodavce!
-- ✅ GOOD: "vozac_id = auth.uid()" - ovo dozvoljava svima

-- =====================================================
-- **KORAK 3:** Proveri CHECK constraint
-- =====================================================

SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%notifikacije%';

-- Proveri da li su svi tipovi dozvoljeni:
-- ✅ 'tura_odobrena', 'vozac_dodeljen', 'tura_zavrsena', 'admin_poruka'

-- =====================================================
-- **KORAK 4:** Proveri kolone u notifikacije tabeli
-- =====================================================

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'notifikacije'
ORDER BY ordinal_position;

-- Trebalo bi da vidiš:
-- - vozac_id (UUID) - koristi se I za vozače I za poslodavce
-- - tip (text)
-- - poruka (text)
-- - procitano (boolean)
-- - tura_id (UUID, nullable)
-- itd.

-- =====================================================
-- **KORAK 5:** Test INSERT kao admin (zaobiđi RLS)
-- =====================================================

-- Ako imaš admin pristup, probaj da INSERT-uješ direktno:
/*
INSERT INTO notifikacije (vozac_id, tip, poruka, procitano)
VALUES (
  'POSLODAVAC-ID-OVDE',  -- ⚠️ Zameni!
  'admin_poruka',
  '🧪 ADMIN TEST: Ovo je test poruka direktno od admina.',
  false
);
*/

-- =====================================================
-- **KORAK 6:** Proveri da li poslodavac može da SELECT-uje
-- =====================================================

-- Prijavi se kao poslodavac u Supabase i pokreni:
/*
SELECT * FROM notifikacije WHERE vozac_id = auth.uid();
*/

-- Ako NE vidiš ništa, problem je u RLS SELECT politici!

-- =====================================================
-- 🔍 NAJČEŠĆI PROBLEMI:
-- =====================================================

/*
❌ PROBLEM 1: RLS politika proverava uloga = 'vozac'
   REŠENJE: Promeni u vozac_id = auth.uid() (dozvoljava sve)

❌ PROBLEM 2: Ime politike "Vozaci mogu..." (semantički problem)
   REŠENJE: Rename u "Korisnici mogu..." ili "Users can..."

❌ PROBLEM 3: CHECK constraint ne dozvoljava poslodavac tipove
   REŠENJE: Pokreni ADD-POSLODAVAC-NOTIFIKACIJE-TIPOVI.sql

❌ PROBLEM 4: Realtime nije omogućen
   REŠENJE: ALTER PUBLICATION supabase_realtime ADD TABLE notifikacije;
*/

-- =====================================================
-- ✅ REŠENJE: Pokreni ovu SQL skriptu
-- =====================================================

BEGIN;

-- 1. Obriši stare politike koje ograničavaju na vozače
DROP POLICY IF EXISTS "Vozaci mogu da vide svoje notifikacije" ON public.notifikacije;
DROP POLICY IF EXISTS "Vozaci mogu da azuriraju svoje notifikacije" ON public.notifikacije;

-- 2. Kreiraj nove politike koje dozvoljavaju SVE korisnike
DROP POLICY IF EXISTS "Korisnici mogu da vide svoje notifikacije" ON public.notifikacije;

CREATE POLICY "Korisnici mogu da vide svoje notifikacije"
ON public.notifikacije
FOR SELECT
TO authenticated
USING (vozac_id = auth.uid());

-- 3. Kreiraj politiku za UPDATE
DROP POLICY IF EXISTS "Korisnici mogu da azuriraju svoje notifikacije" ON public.notifikacije;

CREATE POLICY "Korisnici mogu da azuriraju svoje notifikacije"
ON public.notifikacije
FOR UPDATE
TO authenticated
USING (vozac_id = auth.uid())
WITH CHECK (vozac_id = auth.uid());

-- 4. Kreiraj politiku za DELETE
DROP POLICY IF EXISTS "Korisnici mogu da brisu svoje notifikacije" ON public.notifikacije;

CREATE POLICY "Korisnici mogu da brisu svoje notifikacije"
ON public.notifikacije
FOR DELETE
TO authenticated
USING (vozac_id = auth.uid());

COMMIT;

SELECT '✅ RLS politike ažurirane! Svi korisnici (vozači i poslodavci) mogu da vide svoje notifikacije.' as status;

-- =====================================================
-- **KORAK 7:** Testiranje nakon fix-a
-- =====================================================

-- Proveri ponovo kao poslodavac:
SELECT 
  id,
  tip,
  poruka,
  procitano,
  created_at
FROM notifikacije
WHERE vozac_id = auth.uid()  -- Sada koristi auth.uid() umesto hardcoded ID-a
ORDER BY created_at DESC;

SELECT '🎉 DIJAGNOSTIKA ZAVRŠENA! Ako si pokrenuo fix, proveri aplikaciju.' as status;

