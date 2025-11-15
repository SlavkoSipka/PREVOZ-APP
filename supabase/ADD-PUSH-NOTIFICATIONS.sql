-- ============================================
-- PUSH NOTIFICATIONS SETUP
-- ============================================
-- Kreiranje tabele za čuvanje push subscription-a
-- Pokreni ovu skriptu u Supabase SQL Editor-u

-- 1. Kreiraj tabelu za push subscriptions
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  subscription JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: Jedan user može imati samo jedan subscription
  CONSTRAINT push_subscriptions_user_id_key UNIQUE (user_id)
);

-- 2. Indeksi za brže pretraživanje
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id 
ON public.push_subscriptions(user_id);

-- 3. RLS Policies - Korisnici mogu da upravljaju svojim subscription-ima
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Korisnik može da vidi svoj subscription
CREATE POLICY "Users can view their own push subscription"
ON public.push_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Korisnik može da kreira/update-uje svoj subscription
CREATE POLICY "Users can insert their own push subscription"
ON public.push_subscriptions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own push subscription"
ON public.push_subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Korisnik može da obriše svoj subscription
CREATE POLICY "Users can delete their own push subscription"
ON public.push_subscriptions
FOR DELETE
USING (auth.uid() = user_id);

-- 4. Dodaj kolonu za push preferences u users tabelu (opciono)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT true;

COMMENT ON COLUMN public.users.push_enabled IS 'Da li korisnik želi da prima push notifikacije';

-- 5. Function za automatsko ažuriranje updated_at
CREATE OR REPLACE FUNCTION update_push_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger za automatsko ažuriranje updated_at
DROP TRIGGER IF EXISTS trigger_update_push_subscription_updated_at 
ON public.push_subscriptions;

CREATE TRIGGER trigger_update_push_subscription_updated_at
BEFORE UPDATE ON public.push_subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_push_subscription_updated_at();

-- 7. Function za slanje push notifikacija (poziva se iz Edge Functions)
CREATE OR REPLACE FUNCTION get_user_push_subscription(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT subscription INTO result
  FROM public.push_subscriptions
  WHERE user_id = p_user_id
  AND created_at > NOW() - INTERVAL '30 days'; -- Samo aktivni subscription-i (mlađi od 30 dana)
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PROVERA
-- ============================================
-- Proveri da li je tabela kreirana
SELECT 
  table_name, 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'push_subscriptions'
ORDER BY ordinal_position;

-- Proveri RLS policies
SELECT 
  policyname, 
  tablename, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename = 'push_subscriptions';

-- ============================================
-- NAPOMENE
-- ============================================
-- 
-- 1. Ova skripta kreira kompletnu infrastrukturu za push notifikacije
-- 2. Push subscription-i se automatski brišu kada se user obriše (CASCADE)
-- 3. RLS policies osiguravaju da korisnici mogu videti samo svoje subscription-e
-- 4. Subscription-i stariji od 30 dana se ne koriste (mogu biti nevažeći)
-- 5. Nakon ove skripte, potrebno je generisati VAPID keys i dodati ih u env variables
-- 
-- ============================================

