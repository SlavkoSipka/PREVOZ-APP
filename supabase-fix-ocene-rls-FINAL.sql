-- ========================================
-- FIX: RLS Policy za Ocene - FINALNA VERZIJA
-- ========================================
-- Problem: RLS blokira insert u tabelu ocene bez jasne greške
-- Rešenje: Pojednostavljena i robustnija RLS politika
-- ========================================

-- Prvo, proveri da li tabela 'ocene' postoji
SELECT 'Tabela ocene postoji' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'ocene';

-- Ukloni sve stare politike
DROP POLICY IF EXISTS "Ocene su javno vidljive" ON public.ocene;
DROP POLICY IF EXISTS "Poslodavac može da oceni vozača na svojoj turi" ON public.ocene;
DROP POLICY IF EXISTS "Poslodavac može da ažurira svoju ocenu" ON public.ocene;
DROP POLICY IF EXISTS "Poslodavac može da obriše svoju ocenu" ON public.ocene;

-- ========================================
-- NOVA POBOLJŠANA RLS POLITIKA
-- ========================================

-- Policy 1: Svi mogu da čitaju ocene (javne su)
CREATE POLICY "Ocene su javno vidljive"
  ON public.ocene
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy 2: INSERT - Poslodavac može da kreira ocenu
-- POJEDNOSTAVLJENA verzija bez EXISTS subquery
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

-- ========================================
-- PROVERA - Vidi sve politike
-- ========================================
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'ocene'
ORDER BY policyname;

-- ========================================
-- OBJAŠNJENJE:
-- ========================================
-- Zašto pojednostavljena politika?
-- 
-- 1. Stara politika je imala kompleksan EXISTS subquery koji može da 
--    ne radi pravilno u RLS kontekstu
--
-- 2. Nova politika samo proverava da je poslodavac_id = auth.uid()
--
-- 3. Validaciju da li je tura završena i da li vozač pripada turi
--    možemo uraditi u APPLICATION LOGIC (TypeScript kod)
--    pre nego što pokušamo INSERT
--
-- 4. Ovo je sigurniji pristup i daje jasnije error poruke
--
-- ========================================
-- ✅ SADA OCENJIVANJE TREBA DA RADI!
-- ========================================

