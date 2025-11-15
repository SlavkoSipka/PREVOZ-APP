-- =====================================================
-- DODAJ SAOBRAĆAJNU DOZVOLU ZA VOZAČE
-- =====================================================
-- Dodaje kolone za slike saobraćajne dozvole i Storage bucket
-- =====================================================

BEGIN;

-- 1. Dodaj kolone u users tabelu
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS saobracajna_napred TEXT,
ADD COLUMN IF NOT EXISTS saobracajna_pozadi TEXT,
ADD COLUMN IF NOT EXISTS saobracajna_prihvacena BOOLEAN DEFAULT FALSE;

-- 2. Kreiraj Storage bucket za saobraćajne dozvole
INSERT INTO storage.buckets (id, name, public)
VALUES ('saobracajne-dozvole', 'saobracajne-dozvole', false)
ON CONFLICT (id) DO NOTHING;

-- 3. RLS politike za Storage bucket - koristi EMAIL kao folder ime

-- Drop politike ako postoje
DROP POLICY IF EXISTS "Korisnici mogu da uploaduju svoje dozvole" ON storage.objects;
DROP POLICY IF EXISTS "Korisnici mogu da vide svoje dozvole" ON storage.objects;
DROP POLICY IF EXISTS "Admin može da vidi sve dozvole" ON storage.objects;
DROP POLICY IF EXISTS "Korisnici mogu da ažuriraju svoje dozvole" ON storage.objects;
DROP POLICY IF EXISTS "Korisnici mogu da brišu svoje dozvole" ON storage.objects;

-- Kreiraj nove politike (folder ime = email korisnika)
CREATE POLICY "Korisnici mogu da uploaduju svoje dozvole"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'saobracajne-dozvole' 
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'email')
);

CREATE POLICY "Korisnici mogu da vide svoje dozvole"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'saobracajne-dozvole' 
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'email')
);

CREATE POLICY "Admin može da vidi sve dozvole"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'saobracajne-dozvole' 
  AND EXISTS (
    SELECT 1 FROM public.users 
    WHERE users.id = auth.uid() 
    AND users.uloga = 'admin'
  )
);

CREATE POLICY "Korisnici mogu da ažuriraju svoje dozvole"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'saobracajne-dozvole' 
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'email')
);

CREATE POLICY "Korisnici mogu da brišu svoje dozvole"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'saobracajne-dozvole' 
  AND (storage.foldername(name))[1] = (auth.jwt() ->> 'email')
);

COMMIT;

-- Proveri rezultate
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name LIKE 'saobracajna%'
ORDER BY ordinal_position;

SELECT 
  name, 
  public 
FROM storage.buckets 
WHERE id = 'saobracajne-dozvole';

SELECT '✅ GOTOVO! Kolone i Storage bucket kreirani.' as status;

