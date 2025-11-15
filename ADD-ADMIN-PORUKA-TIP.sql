-- =====================================================
-- SQL Skripta za dodavanje 'admin_poruka' tipa u notifikacije
-- i RLS politiku za admina
-- =====================================================

BEGIN;

-- 1. Izmeni CHECK constraint da dozvoljava 'admin_poruka'
ALTER TABLE public.notifikacije
DROP CONSTRAINT IF EXISTS notifikacije_tip_check;

ALTER TABLE public.notifikacije
ADD CONSTRAINT notifikacije_tip_check CHECK (
  tip = ANY (ARRAY[
    'odobreno'::text,
    'odbijeno'::text,
    'nova_ocena'::text,
    'uplata_potrebna'::text,
    'admin_poruka'::text  -- NOVO
  ])
);

-- 2. RLS politika za admina da može da kreira notifikacije
DROP POLICY IF EXISTS "Admin moze da kreira notifikacije" ON public.notifikacije;

CREATE POLICY "Admin moze da kreira notifikacije"
ON public.notifikacije
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.uloga = 'admin'
  )
);

-- 3. RLS politika za admina da može da vidi sve notifikacije
DROP POLICY IF EXISTS "Admin moze da vidi sve notifikacije" ON public.notifikacije;

CREATE POLICY "Admin moze da vidi sve notifikacije"
ON public.notifikacije
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.uloga = 'admin'
  )
);

-- 4. Osiguraj da svi korisnici (vozaci I poslodavci) mogu da vide svoje notifikacije
-- (vozac_id se odnosi na bilo kojeg korisnika - ime je malo zbunjujuće ali tako je u bazi)
DROP POLICY IF EXISTS "Korisnici mogu da vide svoje notifikacije" ON public.notifikacije;

CREATE POLICY "Korisnici mogu da vide svoje notifikacije"
ON public.notifikacije
FOR SELECT
TO authenticated
USING (vozac_id = auth.uid());

-- 5. Osiguraj da svi korisnici mogu da označe notifikacije kao pročitane
DROP POLICY IF EXISTS "Korisnici mogu da azuriraju svoje notifikacije" ON public.notifikacije;

CREATE POLICY "Korisnici mogu da azuriraju svoje notifikacije"
ON public.notifikacije
FOR UPDATE
TO authenticated
USING (vozac_id = auth.uid())
WITH CHECK (vozac_id = auth.uid());

COMMIT;

SELECT '✅ GOTOVO! Tip "admin_poruka" i sve RLS politike su dodati/ažurirani.' as status;

