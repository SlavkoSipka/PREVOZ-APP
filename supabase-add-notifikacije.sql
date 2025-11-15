-- ========================================
-- SETUP ZA NOTIFIKACIJE - KOMPLETAN SCRIPT
-- ========================================

-- Korak 1: Obriši postojeće politike ako postoje
DROP POLICY IF EXISTS "Vozaci mogu da vide svoje notifikacije" ON public.notifikacije;
DROP POLICY IF EXISTS "Vozaci mogu da azuriraju svoje notifikacije" ON public.notifikacije;
DROP POLICY IF EXISTS "Admini mogu da kreiraju notifikacije" ON public.notifikacije;
DROP POLICY IF EXISTS "System moze da kreira notifikacije" ON public.notifikacije;

-- Korak 2: Obriši staru tabelu ako postoji (PAŽNJA: Briše sve podatke!)
DROP TABLE IF EXISTS public.notifikacije CASCADE;

-- Korak 3: Kreiraj novu tabelu
CREATE TABLE public.notifikacije (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vozac_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prijava_id UUID REFERENCES public.prijave(id) ON DELETE CASCADE,
  tip TEXT NOT NULL CHECK (tip IN ('odobreno', 'odbijeno')),
  poruka TEXT NOT NULL,
  procitano BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Korak 4: Omogući Row Level Security
ALTER TABLE public.notifikacije ENABLE ROW LEVEL SECURITY;

-- Korak 5: Kreiraj RLS politike

-- Policy 1: Vozači mogu da vide samo svoje notifikacije
CREATE POLICY "Vozaci mogu da vide svoje notifikacije"
ON public.notifikacije
FOR SELECT
TO authenticated
USING (
  vozac_id = auth.uid()
);

-- Policy 2: Vozači mogu da ažuriraju samo svoje notifikacije
CREATE POLICY "Vozaci mogu da azuriraju svoje notifikacije"
ON public.notifikacije
FOR UPDATE
TO authenticated
USING (
  vozac_id = auth.uid()
)
WITH CHECK (
  vozac_id = auth.uid()
);

-- Policy 3: Bilo koji authenticated korisnik može da kreira notifikacije
-- (Admin će kreirati kroz aplikaciju)
CREATE POLICY "Autentifikovani korisnici mogu da kreiraju notifikacije"
ON public.notifikacije
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy 4: Vozači mogu da brišu svoje notifikacije
CREATE POLICY "Vozaci mogu da brisu svoje notifikacije"
ON public.notifikacije
FOR DELETE
TO authenticated
USING (
  vozac_id = auth.uid()
);

-- Dodaj trigger za ažuriranje updated_at
CREATE OR REPLACE FUNCTION update_notifikacije_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notifikacije_updated_at
BEFORE UPDATE ON public.notifikacije
FOR EACH ROW
EXECUTE FUNCTION update_notifikacije_updated_at();

-- Kreiraj indekse za bolju performansu
CREATE INDEX IF NOT EXISTS idx_notifikacije_vozac_id ON public.notifikacije(vozac_id);
CREATE INDEX IF NOT EXISTS idx_notifikacije_procitano ON public.notifikacije(procitano);
CREATE INDEX IF NOT EXISTS idx_notifikacije_created_at ON public.notifikacije(created_at DESC);

-- Omogući real-time za notifikacije
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifikacije;

