-- ========================================
-- SQL SKRIPTA: Dodavanje statusa 'zavrseno' za prijave
-- ========================================
-- Pokreni ovu skriptu u Supabase SQL Editor-u
-- ========================================

-- Prvo ukloni stari CHECK constraint
ALTER TABLE public.prijave DROP CONSTRAINT IF EXISTS prijave_status_check;

-- Dodaj novi CHECK constraint sa 'zavrseno' statusom
ALTER TABLE public.prijave 
ADD CONSTRAINT prijave_status_check 
CHECK (status IN ('ceka_admina', 'odobreno', 'odbijeno', 'zavrseno'));

-- Provera da je uspešno dodato
SELECT 
  constraint_name, 
  check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'prijave_status_check';

