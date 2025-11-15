-- ========================================
-- FIX: Notifikacije CHECK constraint
-- ========================================
-- Problem: CHECK constraint dozvoljava samo 'odobreno' i 'odbijeno'
--          ali trigger za ocene pokušava da kreira 'nova_ocena'
-- Rešenje: Proširi CHECK constraint da dozvoli sve tipove
-- ========================================

-- Proveri trenutni CHECK constraint
SELECT 
  con.conname as constraint_name,
  pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'notifikacije' 
  AND con.contype = 'c';

-- Ukloni stari CHECK constraint
ALTER TABLE public.notifikacije 
DROP CONSTRAINT IF EXISTS notifikacije_tip_check;

-- Dodaj novi CHECK constraint sa svim tipovima
ALTER TABLE public.notifikacije 
ADD CONSTRAINT notifikacije_tip_check 
CHECK (tip IN ('odobreno', 'odbijeno', 'nova_ocena', 'uplata_potrebna'));

-- ========================================
-- Proveri da je constraint ažuriran
-- ========================================
SELECT 
  '✅ CHECK constraint ažuriran!' as status,
  con.conname as constraint_name,
  pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'notifikacije' 
  AND con.contype = 'c'
  AND con.conname = 'notifikacije_tip_check';

-- ========================================
-- Test: Kreiraj test notifikaciju (opciono)
-- ========================================
-- Možeš ovo da komentarišeš ako ne želiš test
-- Ovo će kreirati notifikaciju sa tipom 'nova_ocena' kao test

-- Prvo uzmi ID nekog vozača iz baze
DO $$
DECLARE
  v_vozac_id UUID;
BEGIN
  -- Uzmi prvi vozac ID iz baze
  SELECT id INTO v_vozac_id 
  FROM public.users 
  WHERE uloga = 'vozac' 
  LIMIT 1;
  
  IF v_vozac_id IS NOT NULL THEN
    -- Kreiraj test notifikaciju
    INSERT INTO public.notifikacije (vozac_id, tip, poruka)
    VALUES (v_vozac_id, 'nova_ocena', '🧪 Test notifikacija - možeš da je obrišeš');
    
    RAISE NOTICE '✅ Test notifikacija kreirana uspešno!';
  ELSE
    RAISE NOTICE '⚠️ Nema vozača u bazi za test';
  END IF;
END $$;

-- ========================================
-- ✅ GOTOVO!
-- ========================================
-- Sada možeš da ocenjuješ vozače bez greške!
-- ========================================

