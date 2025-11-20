-- SQL za brisanje push notifications funkcionalnosti
-- Pokrenite ovo u Supabase SQL Editor-u

-- 1. Drop push_subscriptions tabele
DROP TABLE IF EXISTS public.push_subscriptions CASCADE;

-- 2. Ukloni push_enabled kolonu iz users tabele (ako postoji)
ALTER TABLE public.users DROP COLUMN IF EXISTS push_enabled CASCADE;

-- 3. Gotovo!
-- Push notifications su sada potpuno uklonjene iz baze

