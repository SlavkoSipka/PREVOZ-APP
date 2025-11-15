-- ========================================
-- SQL SKRIPTA: Sistem Ocenjivanja Vozača
-- ========================================
-- Pokreni ovu skriptu u Supabase SQL Editor-u
-- ========================================

-- ========================================
-- TABELA: ocene
-- ========================================
CREATE TABLE IF NOT EXISTS public.ocene (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tura_id UUID NOT NULL REFERENCES public.ture(id) ON DELETE CASCADE,
  vozac_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  poslodavac_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ocena INTEGER NOT NULL CHECK (ocena >= 1 AND ocena <= 5),
  komentar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tura_id, vozac_id, poslodavac_id) -- Jedan poslodavac može da oceni vozača samo jednom po turi
);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

-- Omogući RLS
ALTER TABLE public.ocene ENABLE ROW LEVEL SECURITY;

-- Prvo ukloni sve stare politike (ako postoje)
DROP POLICY IF EXISTS "Ocene su javno vidljive" ON public.ocene;
DROP POLICY IF EXISTS "Poslodavac može da oceni vozača na svojoj turi" ON public.ocene;
DROP POLICY IF EXISTS "Poslodavac može da ažurira svoju ocenu" ON public.ocene;
DROP POLICY IF EXISTS "Poslodavac može da obriše svoju ocenu" ON public.ocene;

-- Policy: Svi autentifikovani korisnici mogu da ČITAJU ocene
CREATE POLICY "Ocene su javno vidljive"
  ON public.ocene
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Samo poslodavac može da KREIRA ocenu za svoju turu
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

-- Policy: Samo poslodavac može da AŽURIRA svoju ocenu
CREATE POLICY "Poslodavac može da ažurira svoju ocenu"
  ON public.ocene
  FOR UPDATE
  TO authenticated
  USING (poslodavac_id = auth.uid())
  WITH CHECK (poslodavac_id = auth.uid());

-- Policy: Samo poslodavac može da OBRIŠE svoju ocenu
CREATE POLICY "Poslodavac može da obriše svoju ocenu"
  ON public.ocene
  FOR DELETE
  TO authenticated
  USING (poslodavac_id = auth.uid());

-- ========================================
-- INDEXI ZA PERFORMANSE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_ocene_vozac 
ON public.ocene(vozac_id);

CREATE INDEX IF NOT EXISTS idx_ocene_tura 
ON public.ocene(tura_id);

CREATE INDEX IF NOT EXISTS idx_ocene_poslodavac 
ON public.ocene(poslodavac_id);

-- ========================================
-- FUNKCIJA: Izračunaj prosečnu ocenu vozača
-- ========================================

CREATE OR REPLACE FUNCTION prosecna_ocena_vozaca(p_vozac_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  v_prosek NUMERIC;
BEGIN
  SELECT ROUND(AVG(ocena)::NUMERIC, 2)
  INTO v_prosek
  FROM ocene
  WHERE vozac_id = p_vozac_id;
  
  RETURN COALESCE(v_prosek, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- FUNKCIJA: Izračunaj broj ocena vozača
-- ========================================

CREATE OR REPLACE FUNCTION broj_ocena_vozaca(p_vozac_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_broj INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_broj
  FROM ocene
  WHERE vozac_id = p_vozac_id;
  
  RETURN COALESCE(v_broj, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- FUNKCIJA: Posalji notifikaciju za novu ocenu
-- ========================================

CREATE OR REPLACE FUNCTION notifikuj_vozaca_o_oceni()
RETURNS TRIGGER AS $$
DECLARE
  v_poslodavac_ime TEXT;
  v_tura_info TEXT;
BEGIN
  -- Učitaj ime poslodavca i info o turi
  SELECT 
    u.puno_ime,
    t.polazak || ' → ' || t.destinacija
  INTO v_poslodavac_ime, v_tura_info
  FROM users u, ture t
  WHERE u.id = NEW.poslodavac_id
    AND t.id = NEW.tura_id;
  
  -- Kreiraj notifikaciju
  INSERT INTO notifikacije (vozac_id, tip, poruka)
  VALUES (
    NEW.vozac_id,
    'nova_ocena',
    '⭐ ' || v_poslodavac_ime || ' vas je ocenio sa ' || NEW.ocena || '/5 za turu: ' || v_tura_info ||
    CASE 
      WHEN NEW.komentar IS NOT NULL AND NEW.komentar != '' 
      THEN E'\n\n💬 Komentar: "' || NEW.komentar || '"'
      ELSE ''
    END
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- TRIGGER: Automatski pošalji notifikaciju
-- ========================================

DROP TRIGGER IF EXISTS trigger_notifikuj_ocenu ON public.ocene;

CREATE TRIGGER trigger_notifikuj_ocenu
  AFTER INSERT ON public.ocene
  FOR EACH ROW
  EXECUTE FUNCTION notifikuj_vozaca_o_oceni();

-- ========================================
-- ENABLE REALTIME
-- ========================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.ocene;

-- ========================================
-- PROVERA
-- ========================================

SELECT 
  'Tabela ocene kreirana uspešno!' as status,
  COUNT(*) as broj_ocena
FROM public.ocene;

