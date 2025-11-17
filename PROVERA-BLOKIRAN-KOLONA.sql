-- ================================================
-- PROVERA I POSTAVLJANJE KOLONE 'blokiran' U USERS TABELI
-- ================================================

-- 1. Proveri da li kolona 'blokiran' postoji
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name = 'blokiran';

-- 2. Ako kolona postoji ali nema default vrednost, postavi je
ALTER TABLE public.users 
ALTER COLUMN blokiran SET DEFAULT false;

-- 3. Proveri sve vozače i njihov status blokiranja
SELECT 
  id,
  puno_ime,
  email,
  uloga,
  blokiran,
  verifikovan,
  created_at
FROM public.users
WHERE uloga = 'vozac'
ORDER BY created_at DESC;

-- 4. Ako neki vozači imaju NULL za blokiran, postavi na false
UPDATE public.users
SET blokiran = false
WHERE uloga = 'vozac' AND blokiran IS NULL;

-- ================================================
-- TESTIRANJE BLOKIRANJA/ODBLOKIRANJA
-- ================================================

-- Test 1: Blokiraj jednog vozača (zameni EMAIL_VOZACA sa pravim email-om)
-- UPDATE public.users
-- SET blokiran = true
-- WHERE email = 'EMAIL_VOZACA' AND uloga = 'vozac';

-- Test 2: Odblokiraj vozača
-- UPDATE public.users
-- SET blokiran = false
-- WHERE email = 'EMAIL_VOZACA' AND uloga = 'vozac';

-- ================================================
-- PROVERA DA LI BLOKIRAN VOZAČ MOŽE DA PRIHVATI TURE
-- ================================================
-- (Ovo se proverava u aplikaciji kroz PrihvatiTuruButton)

SELECT 
  u.puno_ime,
  u.blokiran,
  COUNT(p.id) as broj_aktivnih_prijava
FROM public.users u
LEFT JOIN public.prijave p ON u.id = p.vozac_id AND p.status IN ('ceka_admina', 'odobreno')
WHERE u.uloga = 'vozac'
GROUP BY u.id, u.puno_ime, u.blokiran
ORDER BY u.blokiran DESC;

