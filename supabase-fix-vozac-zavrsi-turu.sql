-- ========================================
-- FIX: Dozvoli vozaču da završi svoju dodeljenu turu
-- ========================================
-- Problem: RLS politike ne dozvoljavaju vozaču da ažurira status ture
-- Rešenje: Dodaj politiku koja dozvoljava vozaču da postavi status na 'zavrsena'
--          SAMO za ture gde je on dodeljeni vozač
-- ========================================

-- Dodaj novu RLS politiku
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

-- ========================================
-- PROVERA
-- ========================================
-- Pogledaj sve politike za tabelu 'ture'
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE tablename = 'ture';

-- ========================================
-- ✅ Sada vozač može da završi svoju turu!
-- ========================================

