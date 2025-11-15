-- =====================================================
-- SQL Skripta za dodavanje tipova notifikacija za poslodavce
-- =====================================================

BEGIN;

-- Dodaj nove tipove notifikacija u CHECK constraint
ALTER TABLE public.notifikacije
DROP CONSTRAINT IF EXISTS notifikacije_tip_check;

ALTER TABLE public.notifikacije
ADD CONSTRAINT notifikacije_tip_check CHECK (
  tip = ANY (ARRAY[
    'odobreno'::text,           -- Vozač: prijava odobrena
    'odbijeno'::text,            -- Vozač: prijava odbijena
    'nova_ocena'::text,          -- Vozač: nova ocena od poslodavca
    'uplata_potrebna'::text,     -- Vozač: potrebna uplata provizije
    'admin_poruka'::text,        -- Svi: poruka od admina
    'tura_odobrena'::text,       -- Poslodavac: tura odobrena od admina
    'vozac_dodeljen'::text,      -- Poslodavac: vozač izabran za turu
    'tura_zavrsena'::text        -- Poslodavac: tura završena, može oceniti vozača
  ])
);

-- Dodaj opciono polje za ID ture (za poslodavce)
ALTER TABLE public.notifikacije
ADD COLUMN IF NOT EXISTS tura_id UUID REFERENCES public.ture(id) ON DELETE CASCADE;

-- Kreiraj indeks za brže pretraživanje po tura_id
CREATE INDEX IF NOT EXISTS idx_notifikacije_tura_id 
ON public.notifikacije(tura_id);

COMMIT;

SELECT '✅ GOTOVO! Novi tipovi notifikacija za poslodavce dodati.' as status;

