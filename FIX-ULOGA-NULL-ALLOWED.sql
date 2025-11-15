-- =====================================================
-- FIX: Dozvoli NULL za uloga kolonu
-- =====================================================
-- Uloga se NE postavlja odmah, nego tek nakon onboarding-a
-- kada korisnik završi unos podataka i klikne "Sačuvaj"
-- =====================================================

BEGIN;

-- 1. Dozvoli NULL vrednost za uloga kolonu
ALTER TABLE public.users 
ALTER COLUMN uloga DROP NOT NULL;

-- 2. Ukloni stari CHECK constraint
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_uloga_check;

-- 3. Dodaj novi CHECK constraint koji dozvoljava NULL
ALTER TABLE public.users 
ADD CONSTRAINT users_uloga_check 
CHECK (uloga IS NULL OR uloga IN ('vozac', 'poslodavac', 'admin'));

-- 4. Ažuriraj trigger funkciju - NE postavlja default 'vozac'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, uloga, puno_ime, telefon, profil_popunjen)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'uloga',  -- ✅ Može biti NULL!
    COALESCE(NEW.raw_user_meta_data->>'puno_ime', ''),
    COALESCE(NEW.raw_user_meta_data->>'telefon', ''),
    FALSE  -- Svi novi korisnici moraju da popune profil
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Resetuj postojeće profile (osim admin-a)
UPDATE public.users
SET 
  uloga = NULL,
  profil_popunjen = false
WHERE uloga != 'admin';

COMMIT;

-- Proveri rezultate
SELECT 
  uloga,
  COUNT(*) as broj_korisnika,
  COUNT(CASE WHEN profil_popunjen THEN 1 END) as popunjenih
FROM public.users
GROUP BY uloga;

SELECT '✅ GOTOVO! Uloga sada može biti NULL. Postavlja se tek nakon onboarding-a.' as status;

