-- ================================================
-- FIX: Admin ne može da update-uje 'blokiran' u users tabeli
-- ================================================
-- Problem: RLS politika ne dozvoljava admin-u da menja 'blokiran' status

-- 1. Prvo proveri postojeće RLS politike na users tabeli
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- ================================================
-- 2. DODAJ RLS POLITIKU: Admin može da UPDATE-uje sve korisnike
-- ================================================

-- Obriši staru politiku ako postoji
DROP POLICY IF EXISTS "Admin moze da azurira sve korisnike" ON public.users;

-- Kreiraj novu politiku
CREATE POLICY "Admin moze da azurira sve korisnike"
ON public.users
FOR UPDATE
TO authenticated
USING (
  -- Dozvoli admin-u da update-uje bilo kog korisnika
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND uloga = 'admin'
  )
)
WITH CHECK (
  -- Dozvoli admin-u da update-uje bilo kog korisnika
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND uloga = 'admin'
  )
);

-- ================================================
-- 3. PROVERA: Testiraj da li admin može da update-uje
-- ================================================

-- Prvo proveri trenutnog korisnika (admin)
SELECT 
  auth.uid() as trenutni_korisnik_id,
  (SELECT uloga FROM public.users WHERE id = auth.uid()) as uloga,
  (SELECT puno_ime FROM public.users WHERE id = auth.uid()) as ime;

-- Testiraj UPDATE kao admin (zameni USER_ID_ZA_TESTIRANJE sa ID-em nekog vozača)
-- UPDATE public.users
-- SET blokiran = true
-- WHERE id = 'USER_ID_ZA_TESTIRANJE';

-- ================================================
-- 4. DODATNA PROVERA: Vidi sve politike posle izmene
-- ================================================

SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'users' AND cmd = 'UPDATE'
ORDER BY policyname;

-- ================================================
-- ALTERNATIVA: Ako gornja politika ne radi, koristi ovu:
-- ================================================

-- Obriši prethodnu
-- DROP POLICY IF EXISTS "Admin moze da azurira sve korisnike" ON public.users;

-- Kreiraj jednostavniju verziju
-- CREATE POLICY "Admin full access za update"
-- ON public.users
-- FOR UPDATE
-- TO authenticated
-- USING (
--   (SELECT uloga FROM public.users WHERE id = auth.uid()) = 'admin'
-- )
-- WITH CHECK (
--   (SELECT uloga FROM public.users WHERE id = auth.uid()) = 'admin'
-- );

