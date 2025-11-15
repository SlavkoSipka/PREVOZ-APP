-- ========================================
-- 🧾 DODAVANJE POLJA ZA FAKTURU
-- ========================================
-- Ova skripta dodaje polje "faktura" u tabelu ture
-- Pokreni ovu skriptu u Supabase SQL Editor-u
-- ========================================

-- Dodaj kolonu za fakturu u tabelu ture
ALTER TABLE public.ture 
ADD COLUMN IF NOT EXISTS faktura TEXT CHECK (faktura IN ('da', 'ne', 'nije_obavezna'));

-- Postavi default vrednost na 'nije_obavezna' za postojeće ture
UPDATE public.ture 
SET faktura = 'nije_obavezna' 
WHERE faktura IS NULL;

-- ========================================
-- ✅ PROVERA - Da li je kolona dodata
-- ========================================

SELECT 
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'ture' 
  AND table_schema = 'public'
  AND column_name = 'faktura';

-- ========================================
-- 📝 NAPOMENA
-- ========================================
-- Moguće vrednosti za fakturu:
-- - 'da' - Faktura je obavezna
-- - 'ne' - Faktura nije potrebna
-- - 'nije_obavezna' - Faktura može ali ne mora
-- ========================================

