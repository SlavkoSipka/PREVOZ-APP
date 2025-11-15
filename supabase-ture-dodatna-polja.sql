-- ========================================
-- DODAVANJE DODATNIH POLJA ZA TURE
-- ========================================
-- Admin treba da vidi SVE detalje koje je poslodavac uneo!
-- ========================================

-- Dodaj kolone za detaljnije informacije o turi
ALTER TABLE public.ture 
ADD COLUMN IF NOT EXISTS tacna_adresa_polazak TEXT,
ADD COLUMN IF NOT EXISTS tacna_adresa_destinacija TEXT,
ADD COLUMN IF NOT EXISTS vreme_polaska TEXT,
ADD COLUMN IF NOT EXISTS kontakt_telefon TEXT,
ADD COLUMN IF NOT EXISTS dodatne_napomene TEXT;

-- Proveri da li su kolone dodate
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ture' 
AND table_schema = 'public'
AND column_name IN (
  'tacna_adresa_polazak', 
  'tacna_adresa_destinacija', 
  'vreme_polaska', 
  'kontakt_telefon', 
  'dodatne_napomene'
)
ORDER BY column_name;

-- ========================================
-- GOTOVO!
-- ========================================
-- Sada admin može da vidi:
-- ✅ Tačnu adresu polaska
-- ✅ Tačnu adresu destinacije
-- ✅ Vreme polaska
-- ✅ Kontakt telefon poslodavca
-- ✅ Dodatne napomene
-- ========================================

