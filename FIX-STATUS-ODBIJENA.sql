-- =====================================================
-- FIX: Dodaj 'odbijena' kao validan status za ture
-- =====================================================
-- Omogućava admin-u da odbije turu umesto da je briše
-- =====================================================

BEGIN;

-- 1. Ukloni stari CHECK constraint
ALTER TABLE public.ture
DROP CONSTRAINT IF EXISTS ture_status_check;

-- 2. Dodaj novi CHECK constraint sa 'odbijena'
ALTER TABLE public.ture
ADD CONSTRAINT ture_status_check
CHECK (status IN ('aktivna', 'na_cekanju', 'dodeljena', 'zavrsena', 'odbijena'));

COMMIT;

-- Proveri rezultate
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'ture' AND column_name = 'status';

SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'ture_status_check';

SELECT '✅ GOTOVO! Status "odbijena" je dodat za ture.' as status;

