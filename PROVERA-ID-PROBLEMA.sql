-- =====================================================
-- PROVERA: Da li su notifikacije kreirane sa pravim ID-om?
-- =====================================================

-- **KORAK 1:** Pronađi ID poslodavca
SELECT 
  id as poslodavac_id,
  email, 
  puno_ime,
  naziv_firme,
  uloga
FROM users 
WHERE uloga = 'poslodavac'
ORDER BY created_at DESC
LIMIT 5;

-- ⚠️ KOPIRAJ poslodavac_id od gore!

-- =====================================================
-- **KORAK 2:** Proveri da li POSTOJE notifikacije za taj ID
-- =====================================================

SELECT 
  id,
  vozac_id,  -- ← Proveri da li ovaj ID odgovara poslodavac_id!
  tip,
  poruka,
  procitano,
  created_at
FROM notifikacije
WHERE vozac_id = 'POSLODAVAC-ID-OVDE'  -- ⚠️ Zameni!
ORDER BY created_at DESC;

-- ✅ Ako VIDIŠ notifikacije: Notifikacije POSTOJE u bazi
-- ❌ Ako NE VIDIŠ ništa: INSERT nije uspeo ili si stavio pogrešan ID!

-- =====================================================
-- **KORAK 3:** Proveri SVE notifikacije u bazi (debug)
-- =====================================================

SELECT 
  id,
  vozac_id,
  tip,
  poruka,
  LEFT(poruka, 50) as kratak_opis,
  created_at
FROM notifikacije
ORDER BY created_at DESC
LIMIT 20;

-- Pogledaj da li imaš TEST notifikacije za poslodavca
-- Proveri da li `vozac_id` odgovara poslodavac ID-u

-- =====================================================
-- **KORAK 4:** Uporedi ID-ove
-- =====================================================

-- Proveri da li auth.uid() vraća ispravan ID:
SELECT 
  auth.uid() as trenutni_korisnik_id,
  (SELECT uloga FROM users WHERE id = auth.uid()) as uloga;

-- ⚠️ Ovo moraš pokrenuti dok si prijavljen kao poslodavac!
-- Rezultat bi trebalo da bude poslodavac ID i uloga = 'poslodavac'

-- =====================================================
-- **KORAK 5:** Test query koji app koristi (sa auth.uid)
-- =====================================================

-- Prijavljen kao POSLODAVAC, pokreni:
SELECT 
  id, 
  tip, 
  poruka, 
  procitano, 
  created_at, 
  tura_id,
  vozac_id
FROM notifikacije
WHERE vozac_id = auth.uid()  -- ← Koristi auth.uid() umesto hardcoded ID
ORDER BY created_at DESC;

-- ✅ Ako VIDIŠ notifikacije: RLS radi, problem je u aplikaciji
-- ❌ Ako NE VIDIŠ: Problem je u RLS ili notifikacije nisu kreirane

-- =====================================================
-- 🔧 FIX 1: RE-INSERT notifikacije sa PROVJERENIM ID-om
-- =====================================================

-- Prvo OBRIŠI stare test notifikacije
DELETE FROM notifikacije 
WHERE poruka LIKE '%TEST%';

-- Sada INSERT ponovo sa TAČNIM ID-om:
-- ⚠️ ZAMENI 'POSLODAVAC-ID-OVDE' sa ID-om iz KORAKA 1!

INSERT INTO notifikacije (vozac_id, tip, poruka, procitano)
VALUES 
  ('POSLODAVAC-ID-OVDE', 'tura_odobrena', '✅ TEST: Tura odobrena!', false),
  ('POSLODAVAC-ID-OVDE', 'vozac_dodeljen', '🚚 TEST: Vozač dodeljen!', false),
  ('POSLODAVAC-ID-OVDE', 'tura_zavrsena', '🎉 TEST: Tura završena!', false),
  ('POSLODAVAC-ID-OVDE', 'admin_poruka', '📬 TEST: Admin poruka!', false);

-- Proveri da li je INSERT uspeo:
SELECT * FROM notifikacije 
WHERE vozac_id = 'POSLODAVAC-ID-OVDE'  -- ⚠️ Zameni!
ORDER BY created_at DESC;

-- =====================================================
-- 🔧 FIX 2: Proveri RLS INSERT policy
-- =====================================================

-- Da li uopšte MOŽEŠ da INSERT-uješ kao poslodavac?
SELECT 
  policyname,
  cmd,
  with_check
FROM pg_policies 
WHERE tablename = 'notifikacije'
AND cmd = 'INSERT';

-- Trebalo bi da vidiš politiku koja dozvoljava INSERT
-- Npr: "Autentifikovani korisnici mogu da kreiraju notifikacije"

-- =====================================================
-- 🎯 NAJČEŠĆI PROBLEM: Pogrešan ID u INSERT-u!
-- =====================================================

/*
❌ GREŠKA: Kopirao si pogrešan ID iz SQL rezultata
   REŠENJE: Pažljivo kopiraj ID iz KORAKA 1 i zameni

❌ GREŠKA: INSERT politika blokira poslodavce
   REŠENJE: Dodaj/izmeni INSERT politiku

❌ GREŠKA: auth.uid() vraća null
   REŠENJE: Proveri da li si zaista prijavljen u Supabase dashboard
*/

-- =====================================================
-- ✅ KOMPLETNA DIJAGNOSTIKA
-- =====================================================

SELECT '=== DIJAGNOSTIKA REZULTATI ===' as naslov;

-- 1. Moj ID i uloga
SELECT 
  auth.uid() as moj_id,
  u.email,
  u.puno_ime,
  u.uloga
FROM users u
WHERE u.id = auth.uid();

-- 2. Moje notifikacije (direktan query)
SELECT 
  COUNT(*) as broj_notifikacija
FROM notifikacije
WHERE vozac_id = auth.uid();

-- 3. RLS politike za SELECT
SELECT 
  policyname
FROM pg_policies 
WHERE tablename = 'notifikacije'
AND cmd = 'SELECT';

SELECT '=== DIJAGNOSTIKA ZAVRŠENA ===' as kraj;

-- =====================================================
-- 📋 CHECKLIST:
-- =====================================================

/*
□ Proverio sam da je ID poslodavca tačan
□ Proverio sam da notifikacije postoje u bazi sa tim ID-om
□ Proverio sam da auth.uid() vraća tačan ID
□ Proverio sam da RLS SELECT politika dozvoljava pristup
□ Proverio sam da query radi u SQL editor-u
□ Proverio sam da aplikacija koristi tačan query
*/

