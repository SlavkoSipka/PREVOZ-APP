-- ========================================
-- SUPABASE KOMPLETNE IZMENE BAZE PODATAKA
-- ========================================
-- Pokrenite ove SQL skripte u Supabase SQL Editor-u

-- ========================================
-- 1. RATING SISTEM
-- ========================================
-- Dodavanje kolona za ocenjivanje vozača

ALTER TABLE public.ture 
ADD COLUMN IF NOT EXISTS vozac_rating INTEGER CHECK (vozac_rating >= 1 AND vozac_rating <= 5),
ADD COLUMN IF NOT EXISTS vozac_komentar TEXT,
ADD COLUMN IF NOT EXISTS ocenjen_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_ture_vozac_rating ON public.ture(vozac_rating);
CREATE INDEX IF NOT EXISTS idx_ture_dodeljeni_vozac_status ON public.ture(dodeljeni_vozac_id, status);

-- ========================================
-- 2. DETALJNE INFORMACIJE O TURI
-- ========================================
-- Dodavanje privatnih podataka vidljivih samo dodeljenom vozaču

ALTER TABLE public.ture 
ADD COLUMN IF NOT EXISTS tacna_adresa_polazak TEXT,
ADD COLUMN IF NOT EXISTS tacna_adresa_destinacija TEXT,
ADD COLUMN IF NOT EXISTS vreme_polaska TIME,
ADD COLUMN IF NOT EXISTS kontakt_telefon TEXT,
ADD COLUMN IF NOT EXISTS kontakt_email TEXT,
ADD COLUMN IF NOT EXISTS dodatne_napomene TEXT;

-- ========================================
-- 3. NAZIV FIRME
-- ========================================
-- Dodavanje kolone naziv_firme u users tabeli

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS naziv_firme TEXT;

-- ========================================
-- 4. INDEKSI ZA PERFORMANSE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_ture_datum ON public.ture(datum);
CREATE INDEX IF NOT EXISTS idx_ture_created_at ON public.ture(created_at);

-- ========================================
-- 5. FUNKCIJE ZA STATISTIKU
-- ========================================

-- Funkcija za prosečnu ocenu vozača
CREATE OR REPLACE FUNCTION get_vozac_avg_rating(vozac_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_rating NUMERIC;
BEGIN
  SELECT ROUND(AVG(vozac_rating), 1)
  INTO avg_rating
  FROM public.ture
  WHERE dodeljeni_vozac_id = vozac_id_param 
    AND vozac_rating IS NOT NULL
    AND status = 'zavrsena';
    
  RETURN COALESCE(avg_rating, 0);
END;
$$ LANGUAGE plpgsql;

-- Funkcija za broj završenih tura vozača
CREATE OR REPLACE FUNCTION get_vozac_completed_tours(vozac_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  tour_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO tour_count
  FROM public.ture
  WHERE dodeljeni_vozac_id = vozac_id_param 
    AND status = 'zavrsena';
    
  RETURN COALESCE(tour_count, 0);
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- 6. VERIFIKACIJA
-- ========================================
-- Proverite da li su kolone uspešno dodate

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ture' 
  AND column_name IN (
    'vozac_rating', 
    'vozac_komentar', 
    'ocenjen_at',
    'tacna_adresa_polazak',
    'tacna_adresa_destinacija',
    'vreme_polaska',
    'kontakt_telefon',
    'kontakt_email',
    'dodatne_napomene'
  )
ORDER BY column_name;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name = 'naziv_firme';

-- ========================================
-- GOTOVO! ✅
-- ========================================
-- Sve izmene su primenjene.

