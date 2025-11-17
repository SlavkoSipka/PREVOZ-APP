-- =====================================================
-- TEST SCRIPT: Generiši sve tipove notifikacija za vozača
-- =====================================================
-- Ovaj script kreira sve moguće tipove notifikacija 
-- za testiranje sistema notifikacija
-- =====================================================

-- **KORAK 1:** Pronađi svoj vozač ID
SELECT 
  id, 
  email, 
  puno_ime, 
  uloga,
  blokiran
FROM users 
WHERE uloga = 'vozac'
ORDER BY created_at DESC
LIMIT 5;

-- ⚠️ KOPIRAJ ID vozača od gore i zameni 'VOZAC-ID-OVDE' u svim INSERT-ima ispod!

-- =====================================================
-- **KORAK 2:** Obriši stare test notifikacije (opciono)
-- =====================================================
/*
DELETE FROM notifikacije 
WHERE vozac_id = 'VOZAC-ID-OVDE' 
AND poruka LIKE '%TEST%';
*/

-- =====================================================
-- **KORAK 3:** Kreiraj test notifikacije
-- =====================================================

-- 1️⃣ NOTIFIKACIJA: Prijava odobrena ✅
INSERT INTO notifikacije (vozac_id, tip, poruka, procitano)
VALUES (
  'VOZAC-ID-OVDE',
  'odobreno',
  '✅ TEST: Vaša prijava za turu Beograd → Zagreb (25.11.2024) je odobrena! 🎉',
  false
);

-- 2️⃣ NOTIFIKACIJA: Prijava odbijena ❌
INSERT INTO notifikacije (vozac_id, tip, poruka, procitano)
VALUES (
  'VOZAC-ID-OVDE',
  'odbijeno',
  '❌ TEST: Vaša prijava za turu Novi Sad → Ljubljana (26.11.2024) je odbijena. Razlog: Odabran je drugi vozač za ovu turu.',
  false
);

-- 3️⃣ NOTIFIKACIJA: Nova ocena ⭐
INSERT INTO notifikacije (vozac_id, tip, poruka, procitano)
VALUES (
  'VOZAC-ID-OVDE',
  'nova_ocena',
  '⭐ TEST: Dobili ste novu ocenu 5/5 od poslodavca! Odličan posao! 🎉',
  false
);

-- 4️⃣ NOTIFIKACIJA: Potrebna uplata provizije 💰
INSERT INTO notifikacije (vozac_id, tip, poruka, procitano)
VALUES (
  'VOZAC-ID-OVDE',
  'uplata_potrebna',
  '💰 TEST: Potrebna je uplata provizije od 15€ za završenu turu Niš → Sofija. Molimo izvršite uplatu.',
  false
);

-- 5️⃣ NOTIFIKACIJA: Poruka od administratora 📬
INSERT INTO notifikacije (vozac_id, tip, poruka, procitano)
VALUES (
  'VOZAC-ID-OVDE',
  'admin_poruka',
  '📬 TEST: Ovo je poruka od administratora. Molimo vas da ažurirate vaše podatke u profilu.',
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
WHERE vozac_id = 'VOZAC-ID-OVDE'
ORDER BY created_at DESC
LIMIT 10;

-- =====================================================
-- **KORAK 5:** Proveri broj nepročitanih
-- =====================================================

SELECT COUNT(*) as neprocitane_notifikacije
FROM notifikacije
WHERE vozac_id = 'VOZAC-ID-OVDE'
AND procitano = false;

-- =====================================================
-- ✅ GOTOVO! 
-- =====================================================
-- 
-- Sada:
-- 1. Idi na aplikaciju kao vozač
-- 2. Proveri zvonce - trebalo bi da piše 5 nepročitanih
-- 3. Klikni na Notifikacije
-- 4. Trebalo bi da vidiš svih 5 tipova notifikacija
-- 5. Proveri da li svaka ima odgovarajuću ikonicu i boju
--
-- Tipovi i boje:
-- ✅ 'odobreno' - Zelena (CheckCircle)
-- ❌ 'odbijeno' - Crvena (XCircle)
-- ⭐ 'nova_ocena' - Žuta (Star)
-- 💰 'uplata_potrebna' - Narandžasta (AlertCircle)
-- 📬 'admin_poruka' - Plava (Mail)
--
-- =====================================================
-- DODATNO: Napravi jednu pročitanu notifikaciju
-- =====================================================

INSERT INTO notifikacije (vozac_id, tip, poruka, procitano)
VALUES (
  'VOZAC-ID-OVDE',
  'odobreno',
  '✅ TEST (PROČITANO): Ovo je stara pročitana notifikacija.',
  true
);

-- =====================================================
-- CLEAN UP: Obriši sve test notifikacije nakon testiranja
-- =====================================================
/*
-- Pokreni ovo kada završiš testiranje:
DELETE FROM notifikacije 
WHERE vozac_id = 'VOZAC-ID-OVDE' 
AND poruka LIKE '%TEST%';
*/

SELECT '🎉 Sve test notifikacije su kreirane! Proveri aplikaciju.' as status;

