-- ========================================
-- 🔧 FIX ZA ZAVRŠAVANJE TURA I OCENJIVANJE
-- ========================================
-- Pokreni ovu skriptu u Supabase SQL Editor-u
-- Rešava 2 problema:
-- 1. Vozač ne može da završi turu
-- 2. Poslodavac ne može da oceni vozača
-- ========================================

-- ========================================
-- DEO 1: RLS Politika - Vozač završava turu
-- ========================================

-- Proveri da li politika već postoji
SELECT 'Proveravam postojeće politike za ture...' as status;

SELECT 
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'ture'
  AND policyname LIKE '%Vozac%';

-- Dodaj novu RLS politiku za završavanje ture
DROP POLICY IF EXISTS "Vozac moze da zavrsi svoju dodeljenu turu" ON public.ture;

CREATE POLICY "Vozac moze da zavrsi svoju dodeljenu turu"
  ON public.ture
  FOR UPDATE
  TO authenticated
  USING (
    -- Vozač može da ažurira turu samo ako je on dodeljeni vozač
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() 
        AND uloga = 'vozac' 
        AND id = dodeljeni_vozac_id
    )
    AND status = 'dodeljena' -- Tura mora biti u statusu 'dodeljena'
  )
  WITH CHECK (
    -- Vozač može da postavi status SAMO na 'zavrsena'
    status = 'zavrsena'
  );

SELECT '✅ RLS politika za završavanje tura kreirana!' as status;

-- ========================================
-- DEO 2: FIX za Notifikacije - CHECK constraint
-- ========================================

SELECT 'Proveravam CHECK constraint za notifikacije...' as status;

-- Ukloni stari CHECK constraint
ALTER TABLE public.notifikacije 
DROP CONSTRAINT IF EXISTS notifikacije_tip_check;

-- Dodaj novi CHECK constraint sa svim tipovima
ALTER TABLE public.notifikacije 
ADD CONSTRAINT notifikacije_tip_check 
CHECK (tip IN ('odobreno', 'odbijeno', 'nova_ocena', 'uplata_potrebna'));

SELECT '✅ CHECK constraint za notifikacije ažuriran!' as status;

-- ========================================
-- DEO 3: RLS Politike - Ocenjivanje vozača
-- ========================================

SELECT 'Proveravam postojeće politike za ocene...' as status;

SELECT 
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'ocene';

-- Ukloni sve stare politike (da izbegnemo duplikate)
DROP POLICY IF EXISTS "Ocene su javno vidljive" ON public.ocene;
DROP POLICY IF EXISTS "Poslodavac može da oceni vozača na svojoj turi" ON public.ocene;
DROP POLICY IF EXISTS "Poslodavac moze da oceni vozaca" ON public.ocene;
DROP POLICY IF EXISTS "Poslodavac može da ažurira svoju ocenu" ON public.ocene;
DROP POLICY IF EXISTS "Poslodavac moze da azurira svoju ocenu" ON public.ocene;
DROP POLICY IF EXISTS "Poslodavac može da obriše svoju ocenu" ON public.ocene;
DROP POLICY IF EXISTS "Poslodavac moze da obrise svoju ocenu" ON public.ocene;

-- Policy 1: Svi mogu da čitaju ocene (javne su)
CREATE POLICY "Ocene su javno vidljive"
  ON public.ocene
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: INSERT - Poslodavac može da kreira ocenu
CREATE POLICY "Poslodavac moze da oceni vozaca"
  ON public.ocene
  FOR INSERT
  TO authenticated
  WITH CHECK (
    poslodavac_id = auth.uid()
  );

-- Policy 3: UPDATE - Poslodavac može da ažurira svoju ocenu
CREATE POLICY "Poslodavac moze da azurira svoju ocenu"
  ON public.ocene
  FOR UPDATE
  TO authenticated
  USING (poslodavac_id = auth.uid())
  WITH CHECK (poslodavac_id = auth.uid());

-- Policy 4: DELETE - Poslodavac može da obriše svoju ocenu
CREATE POLICY "Poslodavac moze da obrise svoju ocenu"
  ON public.ocene
  FOR DELETE
  TO authenticated
  USING (poslodavac_id = auth.uid());

SELECT '✅ RLS politike za ocenjivanje kreirane!' as status;
SELECT '✅ CHECK constraint za notifikacije popravljen!' as status;

-- ========================================
-- FINALNA PROVERA
-- ========================================

SELECT '📊 Provera svih politika...' as status;

-- Politike za 'ture'
SELECT 
  '🚚 TURE POLITIKE' as tip,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'ture'
ORDER BY policyname;

-- Politike za 'ocene'
SELECT 
  '⭐ OCENE POLITIKE' as tip,
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'ocene'
ORDER BY policyname;

-- ========================================
-- ✅ GOTOVO! TESTIRANJE:
-- ========================================
-- 
-- 1. ZAVRŠAVANJE TURE:
--    - Prijavi se kao vozač
--    - Otvori dodeljenu turu (status: dodeljena)
--    - Klikni "Završio sam turu"
--    - Status treba da se promeni na 'zavrsena'
--
-- 2. OCENJIVANJE:
--    - Prijavi se kao poslodavac
--    - Otvori završenu turu (status: zavrsena)
--    - Klikni "Oceni vozača"
--    - Izaberi ocenu i klikni "Oceni"
--    - Ocena treba da se kreira
--
-- ========================================

SELECT '🎉 SKRIPTA USPEŠNO IZVRŠENA!' as status;

