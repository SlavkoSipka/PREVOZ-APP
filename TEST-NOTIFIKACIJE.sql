-- =====================================================
-- DIJAGNOSTIKA NOTIFIKACIJA - Proveri zašto ne rade
-- =====================================================

-- 1. Proveri da li tabela postoji i koje kolone ima
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'notifikacije'
ORDER BY ordinal_position;

-- 2. Proveri koliko notifikacija postoji
SELECT COUNT(*) as ukupno_notifikacija FROM notifikacije;

-- 3. Proveri RLS politike
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'notifikacije';

-- 4. Proveri CHECK constraint za tipove
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%notifikacije%';

-- 5. Proveri da li ima notifikacija za trenutnog korisnika
-- (Zameni 'tvoj-user-id' sa pravim UUID-om)
SELECT 
  id,
  vozac_id,
  tip,
  poruka,
  procitano,
  created_at
FROM notifikacije
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- KREIRANJE TEST NOTIFIKACIJE
-- =====================================================

-- **KORAK 1:** Prvo pronađi svoj user ID
SELECT id, email, puno_ime, uloga 
FROM users 
WHERE uloga = 'vozac' 
LIMIT 1;

-- **KORAK 2:** Kopiraj ID od gore i zameni 'VOZAC-ID-OVDE' sa pravim UUID-om
-- Onda pokreni ovaj INSERT:

/*
INSERT INTO notifikacije (vozac_id, tip, poruka, procitano)
VALUES (
  'VOZAC-ID-OVDE',  -- ⚠️ ZAMENI SA PRAVIM ID-OM!
  'admin_poruka',
  '🧪 TEST NOTIFIKACIJA - Ovo je test poruka od sistema. Ako vidiš ovo, notifikacije rade!',
  false
);
*/

-- **KORAK 3:** Proveri da li je notifikacija kreirana
SELECT * FROM notifikacije 
WHERE tip = 'admin_poruka' 
ORDER BY created_at DESC 
LIMIT 1;

-- =====================================================
-- PROVERA REALTIME
-- =====================================================

-- Proveri da li je notifikacije tabela dodata u realtime publication
SELECT 
  schemaname,
  tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename = 'notifikacije';

-- Ako gore nije vratilo notifikacije, pokreni ovo:
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.notifikacije;

-- =====================================================
-- PROVERA ZA POSLODAVCA
-- =====================================================

-- **KORAK 1:** Pronađi poslodavca
SELECT id, email, puno_ime, uloga 
FROM users 
WHERE uloga = 'poslodavac' 
LIMIT 1;

-- **KORAK 2:** Kreiraj test notifikaciju za poslodavca
-- (Zameni 'POSLODAVAC-ID-OVDE' sa pravim UUID-om)

/*
INSERT INTO notifikacije (vozac_id, tip, poruka, procitano)
VALUES (
  'POSLODAVAC-ID-OVDE',  -- ⚠️ ZAMENI SA PRAVIM ID-OM!
  'tura_odobrena',
  '🧪 TEST - Vaša tura je odobrena od strane administratora!',
  false
);
*/

SELECT '✅ SQL dijagnostika spremna! Pokreni query-je redom.' as status;

