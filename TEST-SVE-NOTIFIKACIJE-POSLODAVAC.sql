-- =====================================================
-- TEST SCRIPT: Generiši sve tipove notifikacija za poslodavca
-- =====================================================
-- Ovaj script kreira sve moguće tipove notifikacija 
-- za testiranje sistema notifikacija poslodavca
-- =====================================================

-- **KORAK 1:** Pronađi svoj poslodavac ID
SELECT 
  id, 
  email, 
  puno_ime,
  naziv_firme,
  uloga,
  blokiran
FROM users 
WHERE uloga = 'poslodavac'
ORDER BY created_at DESC
LIMIT 5;

-- ⚠️ KOPIRAJ ID poslodavca od gore i zameni 'POSLODAVAC-ID-OVDE' u svim INSERT-ima ispod!

-- =====================================================
-- **KORAK 2:** Obriši stare test notifikacije (opciono)
-- =====================================================
/*
DELETE FROM notifikacije 
WHERE vozac_id = 'POSLODAVAC-ID-OVDE' 
AND poruka LIKE '%TEST%';
*/

-- =====================================================
-- **KORAK 3:** Kreiraj test notifikacije
-- =====================================================

-- 1️⃣ NOTIFIKACIJA: Tura odobrena ✅
INSERT INTO notifikacije (vozac_id, tip, poruka, procitano)
VALUES (
  'POSLODAVAC-ID-OVDE',
  'tura_odobrena',
  '✅ TEST: Vaša tura Beograd → Zagreb je odobrena od strane administratora i sada je vidljiva vozačima!',
  false
);

-- 2️⃣ NOTIFIKACIJA: Vozač dodeljen 🚚
INSERT INTO notifikacije (vozac_id, tip, poruka, procitano)
VALUES (
  'POSLODAVAC-ID-OVDE',
  'vozac_dodeljen',
  '🚚 TEST: Vozač Marko Marković dodeljen vašoj turi Novi Sad → Ljubljana! Možete ga kontaktirati putem aplikacije.',
  false
);

-- 3️⃣ NOTIFIKACIJA: Tura završena 🎉
INSERT INTO notifikacije (vozac_id, tip, poruka, procitano)
VALUES (
  'POSLODAVAC-ID-OVDE',
  'tura_zavrsena',
  '🎉 TEST: Tura Niš → Sofija je uspešno završena! Hvala vam što koristite TransLink. Možete oceniti vozača kako biste pomogli drugim korisnicima.',
  false
);

-- 4️⃣ NOTIFIKACIJA: Poruka od administratora 📬
INSERT INTO notifikacije (vozac_id, tip, poruka, procitano)
VALUES (
  'POSLODAVAC-ID-OVDE',
  'admin_poruka',
  '📬 TEST: Ovo je poruka od administratora. Hvala vam što koristite našu platformu!',
  false
);

-- =====================================================
-- **KORAK 4:** Proveri da li su notifikacije kreirane
-- =====================================================

SELECT 
  id,
  tip,
  poruka,
  procitano,
  created_at
FROM notifikacije
WHERE vozac_id = 'POSLODAVAC-ID-OVDE'
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- **KORAK 5:** Proveri broj nepročitanih
-- =====================================================

SELECT COUNT(*) as neprocitane_notifikacije
FROM notifikacije
WHERE vozac_id = 'POSLODAVAC-ID-OVDE'
AND procitano = false;

-- =====================================================
-- ✅ GOTOVO! 
-- =====================================================
-- 
-- Sada:
-- 1. Idi na aplikaciju kao poslodavac
-- 2. Proveri zvonce - trebalo bi da piše 4 nepročitanih
-- 3. Klikni na Notifikacije
-- 4. Trebalo bi da vidiš sva 4 tipa notifikacija
-- 5. Proveri da li svaka ima odgovarajuću ikonicu i boju
--
-- Tipovi i boje (za poslodavca):
-- ✅ 'tura_odobrena' - Zelena (CheckCircle)
-- 🚚 'vozac_dodeljen' - Plava (Truck)
-- 🎉 'tura_zavrsena' - Ljubičasta (Star)
-- 📬 'admin_poruka' - Plava (Mail)
--
-- =====================================================
-- DODATNO: Napravi jednu pročitanu notifikaciju
-- =====================================================

INSERT INTO notifikacije (vozac_id, tip, poruka, procitano)
VALUES (
  'POSLODAVAC-ID-OVDE',
  'tura_odobrena',
  '✅ TEST (PROČITANO): Ovo je stara pročitana notifikacija.',
  true
);

-- =====================================================
-- NAPREDNI TEST: Notifikacije sa tura_id
-- =====================================================
-- Ako imaš pravu turu u bazi, možeš kreirati notifikaciju sa tura_id

-- Prvo pronađi neku turu poslodavca:
SELECT 
  id,
  polazak,
  destinacija,
  datum,
  status,
  firma_id
FROM ture
WHERE firma_id = 'POSLODAVAC-ID-OVDE'
LIMIT 5;

-- Kopiraj ID ture i zameni 'TURA-ID-OVDE':
/*
INSERT INTO notifikacije (vozac_id, tura_id, tip, poruka, procitano)
VALUES (
  'POSLODAVAC-ID-OVDE',
  'TURA-ID-OVDE',
  'vozac_dodeljen',
  '🚚 TEST (SA LINKOM): Vozač je dodeljen vašoj turi! Kliknite "Pogledaj turu" za više detalja.',
  false
);
*/

-- =====================================================
-- CLEAN UP: Obriši sve test notifikacije nakon testiranja
-- =====================================================
/*
-- Pokreni ovo kada završiš testiranje:
DELETE FROM notifikacije 
WHERE vozac_id = 'POSLODAVAC-ID-OVDE' 
AND poruka LIKE '%TEST%';
*/

SELECT '🎉 Sve test notifikacije za poslodavca su kreirane! Proveri aplikaciju.' as status;

-- =====================================================
-- BONUS: Uporedna tabela - Vozač vs Poslodavac
-- =====================================================
/*
┌───────────────────────┬───────────┬──────────────┐
│ Tip Notifikacije      │ Vozač     │ Poslodavac   │
├───────────────────────┼───────────┼──────────────┤
│ odobreno              │     ✅    │      ❌      │
│ odbijeno              │     ✅    │      ❌      │
│ nova_ocena            │     ✅    │      ❌      │
│ uplata_potrebna       │     ✅    │      ❌      │
│ admin_poruka          │     ✅    │      ✅      │
│ tura_odobrena         │     ❌    │      ✅      │
│ vozac_dodeljen        │     ❌    │      ✅      │
│ tura_zavrsena         │     ❌    │      ✅      │
└───────────────────────┴───────────┴──────────────┘

VOZAČ ima: 5 tipova notifikacija
POSLODAVAC ima: 4 tipa notifikacija
ZAJEDNIČKO: 'admin_poruka' (1 tip)
UKUPNO RAZLIČITIH: 7 tipova notifikacija
*/

