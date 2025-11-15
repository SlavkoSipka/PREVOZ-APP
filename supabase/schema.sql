-- TransLink Supabase Schema
-- Ova šema definiše sve tabele za TransLink aplikaciju

-- Enabling UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================
-- TABELA: users
-- ==============================================
-- Napomena: Supabase već ima auth.users tabelu
-- Ova tabela proširuje auth.users sa dodatnim poljima
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  uloga TEXT NOT NULL CHECK (uloga IN ('vozac', 'poslodavac', 'admin')),
  email TEXT NOT NULL UNIQUE,
  ime TEXT,
  prezime TEXT,
  puno_ime TEXT,
  telefon TEXT,
  grad TEXT,
  naziv_poslodavca TEXT,
  opis TEXT,
  registarske_tablice TEXT,
  verifikovan BOOLEAN DEFAULT FALSE,
  blokiran BOOLEAN DEFAULT FALSE,
  profil_popunjen BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- TABELA: ture
-- ==============================================
CREATE TABLE IF NOT EXISTS public.ture (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firma_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  polazak TEXT NOT NULL,
  destinacija TEXT NOT NULL,
  datum DATE NOT NULL,
  opis_robe TEXT NOT NULL,
  ponudjena_cena NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'aktivna' CHECK (status IN ('aktivna', 'na_cekanju', 'dodeljena', 'zavrsena')),
  dodeljeni_vozac_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- TABELA: prijave
-- ==============================================
CREATE TABLE IF NOT EXISTS public.prijave (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tura_id UUID NOT NULL REFERENCES public.ture(id) ON DELETE CASCADE,
  vozac_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ceka_admina' CHECK (status IN ('ceka_admina', 'odobreno', 'odbijeno')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tura_id, vozac_id) -- Jedan vozač može prijaviti samo jednom istu turu
);

-- ==============================================
-- TABELA: uplate
-- ==============================================
CREATE TABLE IF NOT EXISTS public.uplate (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vozac_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tura_id UUID NOT NULL REFERENCES public.ture(id) ON DELETE CASCADE,
  iznos NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'u_toku' CHECK (status IN ('u_toku', 'placeno', 'neuspesno')),
  checkout_id TEXT, -- ID iz 2Checkout sistema
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- TABELA: notifikacije
-- ==============================================
CREATE TABLE IF NOT EXISTS public.notifikacije (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  naslov TEXT NOT NULL,
  poruka TEXT NOT NULL,
  procitano BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================

-- Enable RLS na svim tabelama
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ture ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prijave ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uplate ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifikacije ENABLE ROW LEVEL SECURITY;

-- USERS POLICIES
-- Svi autentifikovani korisnici mogu čitati users tabelu
-- (Potrebno za JOIN-ove, provere uloga, i prikaz profila)
-- VAŽNO: Ne pravimo rekurziju provером uloge iz iste tabele!
CREATE POLICY "Authenticated users can view users"
  ON public.users FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Korisnici mogu ažurirati SAMO svoj profil
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Service role (trigger) može INSERT-ovati nove korisnike
CREATE POLICY "Service role can insert users"
  ON public.users FOR INSERT
  WITH CHECK (true);

-- TURE POLICIES
-- Svi autentifikovani korisnici mogu videti aktivne ture
CREATE POLICY "All authenticated users can view active ture"
  ON public.ture FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Poslodavci mogu kreirati ture
CREATE POLICY "Poslodavci can create ture"
  ON public.ture FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND uloga = 'poslodavac' AND id = firma_id
    )
  );

-- Poslodavci mogu ažurirati svoje ture
CREATE POLICY "Poslodavci can update own ture"
  ON public.ture FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND uloga = 'poslodavac' AND id = firma_id
    )
  );

-- Admin može ažurirati sve ture
CREATE POLICY "Admin can update all ture"
  ON public.ture FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND uloga = 'admin'
    )
  );

-- PRIJAVE POLICIES
-- Vozači mogu kreirati prijave
CREATE POLICY "Vozaci can create prijave"
  ON public.prijave FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND uloga = 'vozac' AND id = vozac_id AND blokiran = FALSE
    )
  );

-- Vozači mogu videti svoje prijave
CREATE POLICY "Vozaci can view own prijave"
  ON public.prijave FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND uloga = 'vozac' AND id = vozac_id
    )
  );

-- Admin može videti sve prijave
CREATE POLICY "Admin can view all prijave"
  ON public.prijave FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND uloga = 'admin'
    )
  );

-- Admin može ažurirati sve prijave
CREATE POLICY "Admin can update all prijave"
  ON public.prijave FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND uloga = 'admin'
    )
  );

-- UPLATE POLICIES
-- Vozači mogu videti svoje uplate
CREATE POLICY "Vozaci can view own uplate"
  ON public.uplate FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND uloga = 'vozac' AND id = vozac_id
    )
  );

-- Admin može videti sve uplate
CREATE POLICY "Admin can view all uplate"
  ON public.uplate FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND uloga = 'admin'
    )
  );

-- Sistem može kreirati uplate (preko service role)
CREATE POLICY "Service role can create uplate"
  ON public.uplate FOR INSERT
  WITH CHECK (true);

-- Sistem može ažurirati uplate (preko service role)
CREATE POLICY "Service role can update uplate"
  ON public.uplate FOR UPDATE
  USING (true);

-- NOTIFIKACIJE POLICIES
-- Korisnici mogu videti svoje notifikacije
CREATE POLICY "Users can view own notifikacije"
  ON public.notifikacije FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND id = user_id
    )
  );

-- Korisnici mogu ažurirati svoje notifikacije (npr. označiti kao pročitano)
CREATE POLICY "Users can update own notifikacije"
  ON public.notifikacije FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND id = user_id
    )
  );

-- Sistem može kreirati notifikacije
CREATE POLICY "Service role can create notifikacije"
  ON public.notifikacije FOR INSERT
  WITH CHECK (true);

-- ==============================================
-- FUNKCIJE I TRIGGER-I
-- ==============================================

-- Funkcija za automatsko ažuriranje updated_at polja
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger za users tabelu
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Funkcija koja kreira user zapis nakon registracije
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, uloga, puno_ime, telefon, registarske_tablice, profil_popunjen)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'uloga', 'vozac'),
    COALESCE(NEW.raw_user_meta_data->>'puno_ime', ''),
    COALESCE(NEW.raw_user_meta_data->>'telefon', ''),
    NEW.raw_user_meta_data->>'registarske_tablice',
    CASE 
      WHEN COALESCE(NEW.raw_user_meta_data->>'uloga', 'vozac') = 'poslodavac' THEN FALSE
      ELSE TRUE
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger koji poziva funkciju nakon kreiranja novog korisnika
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Funkcija za kreiranje notifikacije
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_naslov TEXT,
  p_poruka TEXT
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifikacije (user_id, naslov, poruka)
  VALUES (p_user_id, p_naslov, p_poruka)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================
-- INDEKSI ZA BOLJU PERFORMANSU
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_ture_status ON public.ture(status);
CREATE INDEX IF NOT EXISTS idx_ture_firma_id ON public.ture(firma_id);
CREATE INDEX IF NOT EXISTS idx_ture_datum ON public.ture(datum);
CREATE INDEX IF NOT EXISTS idx_prijave_status ON public.prijave(status);
CREATE INDEX IF NOT EXISTS idx_prijave_tura_id ON public.prijave(tura_id);
CREATE INDEX IF NOT EXISTS idx_prijave_vozac_id ON public.prijave(vozac_id);
CREATE INDEX IF NOT EXISTS idx_uplate_status ON public.uplate(status);
CREATE INDEX IF NOT EXISTS idx_uplate_vozac_id ON public.uplate(vozac_id);
CREATE INDEX IF NOT EXISTS idx_notifikacije_user_id ON public.notifikacije(user_id);
CREATE INDEX IF NOT EXISTS idx_notifikacije_procitano ON public.notifikacije(procitano);

-- ==============================================
-- POČETNI ADMIN KORISNIK (OPCIONO)
-- ==============================================
-- Napomena: Prvo kreirajte admin korisnika u Supabase Auth Dashboard,
-- zatim ručno ažurirajte ulogu u users tabeli ili dodajte preko SQL-a.

