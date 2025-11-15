-- ========================================
-- 🚀 KOMPLETNA SETUP SKRIPTA - POKRENI OVO!
-- ========================================
-- Ova skripta sadrži SVE što treba za:
-- 1. Dodatna polja za ture
-- 2. Sistem blokiranja vozača
-- 3. Funkcije i trigere
-- ========================================

-- ========================================
-- DEO 1: DODATNA POLJA ZA TURE
-- ========================================

ALTER TABLE public.ture 
ADD COLUMN IF NOT EXISTS tacna_adresa_polazak TEXT,
ADD COLUMN IF NOT EXISTS tacna_adresa_destinacija TEXT,
ADD COLUMN IF NOT EXISTS vreme_polaska TEXT,
ADD COLUMN IF NOT EXISTS kontakt_telefon TEXT,
ADD COLUMN IF NOT EXISTS dodatne_napomene TEXT,
ADD COLUMN IF NOT EXISTS faktura TEXT CHECK (faktura IN ('da', 'ne', 'nije_obavezna'));

-- ========================================
-- DEO 2: KOLONE ZA BLOKIRANJE VOZAČA
-- ========================================

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS razlog_blokiranja TEXT,
ADD COLUMN IF NOT EXISTS vreme_automatske_blokade TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.prijave 
ADD COLUMN IF NOT EXISTS razlog_odbijanja TEXT;

-- ========================================
-- DEO 3: DODAJ NOVI STATUS 'zavrseno' ZA PRIJAVE
-- ========================================

-- Prvo ukloni stari CHECK constraint
ALTER TABLE public.prijave DROP CONSTRAINT IF EXISTS prijave_status_check;

-- Dodaj novi CHECK constraint sa 'zavrseno' statusom
ALTER TABLE public.prijave 
ADD CONSTRAINT prijave_status_check 
CHECK (status IN ('ceka_admina', 'odobreno', 'odbijeno', 'zavrseno'));

-- ========================================
-- DEO 4: FUNKCIJA ZA PROVERU I BLOKIRANJE
-- ========================================

CREATE OR REPLACE FUNCTION proveri_i_blokiraj_vozaca(p_vozac_id UUID, p_tura_id UUID)
RETURNS boolean AS $$
DECLARE
  v_datum DATE;
  v_vreme TEXT;
  v_polazak TEXT;
  v_destinacija TEXT;
  v_tura_status TEXT;
  v_trebalo_blokirati BOOLEAN := false;
BEGIN
  -- Učitaj podatke o turi
  SELECT t.datum, t.vreme_polaska, t.polazak, t.destinacija, t.status
  INTO v_datum, v_vreme, v_polazak, v_destinacija, v_tura_status
  FROM ture t
  WHERE t.id = p_tura_id;
  
  -- Proveri da li je vreme ture prošlo i tura nije završena
  IF v_datum <= CURRENT_DATE AND v_tura_status IN ('aktivna', 'dodeljena') THEN
    IF (v_vreme IS NOT NULL AND CONCAT(v_datum::text, ' ', v_vreme)::timestamp + INTERVAL '1 hour' <= NOW()) OR
       (v_vreme IS NULL AND v_datum < CURRENT_DATE) THEN
      
      v_trebalo_blokirati := true;
      
      -- Blokiraj vozača
      UPDATE users
      SET 
        blokiran = true,
        razlog_blokiranja = '⚠️ Automatski blokiran - niste izvezli odobrenu turu: ' || 
                           v_polazak || ' → ' || v_destinacija ||
                           ' (datum: ' || v_datum || 
                           CASE WHEN v_vreme IS NOT NULL THEN ', vreme: ' || v_vreme ELSE '' END || '). ' ||
                           'Morate platiti proviziju da bi se nalog deblokirao.',
        vreme_automatske_blokade = NOW()
      WHERE id = p_vozac_id AND blokiran = false;
      
      -- Kreiraj notifikaciju u novoj strukturi (samo ako vozač postoji i nije već blokiran)
      IF FOUND THEN
        INSERT INTO notifikacije (vozac_id, prijava_id, tip, poruka)
        SELECT 
          p_vozac_id,
          p.id,
          'odbijeno',
          '⚠️ Nalog je automatski blokiran jer niste izvezli odobrenu turu (' || 
          v_polazak || ' → ' || v_destinacija || 
          ', datum: ' || v_datum ||
          CASE WHEN v_vreme IS NOT NULL THEN ', vreme: ' || v_vreme ELSE '' END ||
          '). Morate platiti proviziju da bi se nalog deblokirao.'
        FROM prijave p
        WHERE p.vozac_id = p_vozac_id 
          AND p.tura_id = p_tura_id
        LIMIT 1;
      END IF;
    END IF;
  END IF;
  
  RETURN v_trebalo_blokirati;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- DEO 5: FUNKCIJA ZA PROVERU PRIJAVLJIVANJA
-- ========================================

CREATE OR REPLACE FUNCTION moze_se_prijaviti_na_turu(p_vozac_id UUID, p_tura_id UUID)
RETURNS jsonb AS $$
DECLARE
  v_blokiran boolean;
  v_razlog text;
  v_status_prijave text;
  v_tura_id_aktivne UUID;
BEGIN
  -- Prvo proveri sve odobrene ture vozača da vidi da li neka treba da bude blokirana
  FOR v_tura_id_aktivne IN
    SELECT p.tura_id
    FROM prijave p
    WHERE p.vozac_id = p_vozac_id
      AND p.status = 'odobreno'
  LOOP
    PERFORM proveri_i_blokiraj_vozaca(p_vozac_id, v_tura_id_aktivne);
  END LOOP;
  
  -- Sada proveri da li je vozač blokiran
  SELECT blokiran, razlog_blokiranja
  INTO v_blokiran, v_razlog
  FROM users
  WHERE id = p_vozac_id;
  
  IF v_blokiran THEN
    RETURN jsonb_build_object(
      'moze', false,
      'razlog', 'Vaš nalog je blokiran. ' || COALESCE(v_razlog, 'Kontaktirajte administratora.'),
      'tip', 'blokiran'
    );
  END IF;
  
  -- UKLONJENO: Provera da li već ima aktivnu/dodeljenu turu
  -- Vozač sada može da se prijavljuje za više tura istovremeno
  
  -- Proveri da li se već prijavio za ovu turu
  SELECT status INTO v_status_prijave
  FROM prijave
  WHERE vozac_id = p_vozac_id 
    AND tura_id = p_tura_id;
  
  IF v_status_prijave IS NOT NULL THEN
    IF v_status_prijave = 'odbijeno' THEN
      RETURN jsonb_build_object(
        'moze', false,
        'razlog', 'Već ste bili odbijeni za ovu turu. Ne možete se ponovo prijaviti.',
        'tip', 'odbijen'
      );
    ELSE
      RETURN jsonb_build_object(
        'moze', false,
        'razlog', 'Već ste se prijavili za ovu turu.',
        'tip', 'vec_prijavljen'
      );
    END IF;
  END IF;
  
  -- Sve je OK
  RETURN jsonb_build_object(
    'moze', true,
    'razlog', null,
    'tip', 'ok'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- DEO 6: TRIGGER ZA PROVERU PRE PRIJAVE
-- ========================================

CREATE OR REPLACE FUNCTION proveri_vozaca_pre_prijave()
RETURNS TRIGGER AS $$
DECLARE
  v_provera jsonb;
BEGIN
  v_provera := moze_se_prijaviti_na_turu(NEW.vozac_id, NEW.tura_id);
  
  IF (v_provera->>'moze')::boolean = false THEN
    RAISE EXCEPTION '%', v_provera->>'razlog';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_proveri_vozaca_pre_prijave ON public.prijave;

CREATE TRIGGER trigger_proveri_vozaca_pre_prijave
  BEFORE INSERT ON public.prijave
  FOR EACH ROW
  EXECUTE FUNCTION proveri_vozaca_pre_prijave();

-- ========================================
-- DEO 7: FUNKCIJA ZA AUTOMATSKU PROVERU I BLOKIRANJE
-- ========================================

CREATE OR REPLACE FUNCTION proveri_sve_odobrene_ture_vozaca(p_vozac_id UUID)
RETURNS jsonb AS $$
DECLARE
  v_tura_record RECORD;
  v_blokiran BOOLEAN := false;
  v_broj_blokiranih INTEGER := 0;
BEGIN
  -- Prođu kroz sve odobrene ture vozača
  FOR v_tura_record IN
    SELECT p.tura_id
    FROM prijave p
    JOIN ture t ON p.tura_id = t.id
    WHERE p.vozac_id = p_vozac_id
      AND p.status = 'odobreno'
      AND t.status IN ('aktivna', 'dodeljena')
  LOOP
    -- Proveri i blokiraj za svaku turu
    IF proveri_i_blokiraj_vozaca(p_vozac_id, v_tura_record.tura_id) THEN
      v_blokiran := true;
      v_broj_blokiranih := v_broj_blokiranih + 1;
    END IF;
  END LOOP;
  
  RETURN jsonb_build_object(
    'blokiran', v_blokiran,
    'broj_propustenih_tura', v_broj_blokiranih
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- DEO 8: INDEXI ZA PERFORMANSE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_prijave_odobreno_vozac 
ON public.prijave(vozac_id, status) 
WHERE status = 'odobreno';

CREATE INDEX IF NOT EXISTS idx_ture_datum_status 
ON public.ture(datum, status) 
WHERE status IN ('aktivna', 'dodeljena');

CREATE INDEX IF NOT EXISTS idx_users_blokiran 
ON public.users(blokiran) 
WHERE blokiran = true;

-- ========================================
-- GOTOVO! PROVERI DA LI SVE RADI:
-- ========================================

-- Proveri da li su kolone dodate
SELECT 
  'users' as tabela,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name IN ('razlog_blokiranja', 'vreme_automatske_blokade')

UNION ALL

SELECT 
  'ture' as tabela,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'ture' 
  AND table_schema = 'public'
  AND column_name IN ('tacna_adresa_polazak', 'vreme_polaska', 'kontakt_telefon', 'dodatne_napomene')

UNION ALL

SELECT 
  'prijave' as tabela,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'prijave' 
  AND table_schema = 'public'
  AND column_name = 'razlog_odbijanja'
ORDER BY tabela, column_name;

-- ========================================
-- ✅ AKO VIDIŠ REZULTATE, SVE JE OK!
-- ========================================

