-- ========================================
-- FIX: RLS Policy za Ocene - Brza Popravka
-- ========================================
-- Pokreni ovu skriptu ako dobijas grešku prilikom ocenjivanja
-- ========================================

-- Ukloni staru policy
DROP POLICY IF EXISTS "Poslodavac može da oceni vozača na svojoj turi" ON public.ocene;

-- Kreiraj novu, ispravnu policy
CREATE POLICY "Poslodavac može da oceni vozača na svojoj turi"
  ON public.ocene
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Prvo proveri da li je poslodavac_id jednak trenutnom korisniku
    poslodavac_id = auth.uid()
    AND
    -- Zatim proveri da li postoji završena tura sa tim podacima
    EXISTS (
      SELECT 1 FROM ture t
      WHERE t.id = tura_id
        AND t.firma_id = auth.uid()
        AND t.status = 'zavrsena'
        AND t.dodeljeni_vozac_id = vozac_id
    )
  );

-- Provera da je policy kreirana
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'ocene' 
  AND policyname = 'Poslodavac može da oceni vozača na svojoj turi';

