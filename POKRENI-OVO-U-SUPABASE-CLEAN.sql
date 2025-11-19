-- ========================================
-- 🚀 KOMPLETNA SETUP SKRIPTA - CLEAN VERSION
-- ========================================
-- Ova skripta sadrži SVE što treba za:
-- 1. Dodatna polja za ture
-- 2. Kolone za MANUELNO blokiranje (samo admin)
-- 3. Indekse za performanse
-- UKLONJENA SVA AUTOMATSKA LOGIKA BLOKIRANJA!
-- ========================================

-- ========================================
-- DEO 1: DODATNA POLJA ZA TURE
-- ========================================

ALTER TABLE public.ture 
ADD COLUMN IF NOT EXISTS tacna_adresa_polazak TEXT,
ADD COLUMN IF NOT EXISTS tacna_adresa_destinacija TEXT,
ADD COLUMN IF NOT EXISTS vreme_polaska TEXT,
ADD COLUMN IF NOT EXISTS kontakt_telefon TEXT,
ADD COLUMN IF NOT EXISTS dodatne_napomene TEXT,
ADD COLUMN IF NOT EXISTS faktura TEXT CHECK (faktura IN ('da', 'ne', 'nije_obavezna'));

-- ========================================
-- DEO 2: KOLONE ZA MANUELNO BLOKIRANJE
-- ========================================
-- Ove kolone admin koristi za RUČNO blokiranje vozača

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS razlog_blokiranja TEXT,
ADD COLUMN IF NOT EXISTS vreme_automatske_blokade TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.prijave 
ADD COLUMN IF NOT EXISTS razlog_odbijanja TEXT;

-- ========================================
-- DEO 3: DODAJ NOVI STATUS 'zavrseno' ZA PRIJAVE
-- ========================================

-- Prvo ukloni stari CHECK constraint
ALTER TABLE public.prijave DROP CONSTRAINT IF EXISTS prijave_status_check;

-- Dodaj novi CHECK constraint sa 'zavrseno' statusom
ALTER TABLE public.prijave 
ADD CONSTRAINT prijave_status_check 
CHECK (status IN ('ceka_admina', 'odobreno', 'odbijeno', 'zavrseno'));

-- ========================================
-- DEO 4: INDEXI ZA PERFORMANSE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_prijave_odobreno_vozac 
ON public.prijave(vozac_id, status) 
WHERE status = 'odobreno';

CREATE INDEX IF NOT EXISTS idx_ture_datum_status 
ON public.ture(datum, status) 
WHERE status IN ('aktivna', 'dodeljena');

CREATE INDEX IF NOT EXISTS idx_users_blokiran 
ON public.users(blokiran) 
WHERE blokiran = true;

-- ========================================
-- GOTOVO! PROVERI DA LI SVE RADI:
-- ========================================

-- Proveri da li su kolone dodate
SELECT 
  'users' as tabela,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name IN ('razlog_blokiranja', 'vreme_automatske_blokade')

UNION ALL

SELECT 
  'ture' as tabela,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'ture' 
  AND table_schema = 'public'
  AND column_name IN ('tacna_adresa_polazak', 'vreme_polaska', 'kontakt_telefon', 'dodatne_napomene')

UNION ALL

SELECT 
  'prijave' as tabela,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'prijave' 
  AND table_schema = 'public'
  AND column_name = 'razlog_odbijanja'
ORDER BY tabela, column_name;

-- ========================================
-- ✅ AKO VIDIŠ REZULTATE, SVE JE OK!
-- ========================================
-- NAPOMENA: Nema automatskih funkcija ili trigera!
-- Admin može RUČNO da blokira korisnike preko admin UI
-- ========================================

