-- ========================================
-- ADMIN APPROVAL ZA TURE - SUPABASE UPDATE
-- ========================================

-- Korak 1: Ažuriraj CHECK constraint za status kolonu
-- Prvo moramo da drop-ujemo stari constraint
ALTER TABLE public.ture DROP CONSTRAINT IF EXISTS ture_status_check;

-- Dodaj novi constraint sa svim statusima
ALTER TABLE public.ture 
ADD CONSTRAINT ture_status_check 
CHECK (status IN ('aktivna', 'na_cekanju', 'dodeljena', 'zavrsena'));

-- Korak 2: Dodaj indeks za brže filtriranje po statusu
CREATE INDEX IF NOT EXISTS idx_ture_status ON public.ture(status);

-- Korak 3: Ažuriraj postojeće ture da imaju status 'aktivna' (ako nisu već zavrsene)
UPDATE public.ture 
SET status = 'aktivna' 
WHERE status IS NULL;

-- ========================================
-- KRAJ
-- ========================================

