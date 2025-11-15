-- ========================================
-- SISTEM BLOKIRANJA VOZAČA - BEZ CRON JOB-A!
-- ========================================
-- Ovo rešenje radi INSTANT - bez čekanja!
-- Vozač se blokira ODMAH kada tura počne
-- ========================================

-- Korak 1: Dodaj nove kolone
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS razlog_blokiranja TEXT,
ADD COLUMN IF NOT EXISTS vreme_automatske_blokade TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.prijave 
ADD COLUMN IF NOT EXISTS razlog_odbijanja TEXT;

-- Korak 2: Funkcija koja proverava i blokira vozača
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
      
      -- Kreiraj notifikaciju
      INSERT INTO notifikacije (user_id, naslov, poruka)
      VALUES (
        p_vozac_id,
        '⚠️ Nalog je automatski blokiran',
        'Vaš nalog je blokiran jer niste izvezli odobrenu turu (' || 
        v_polazak || ' → ' || v_destinacija || 
        '). Morate platiti proviziju da bi se nalog deblokirao.'
      );
    END IF;
  END IF;
  
  RETURN v_trebalo_blokirati;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Korak 3: Funkcija za proveru da li vozač može da se prijavi
CREATE OR REPLACE FUNCTION moze_se_prijaviti_na_turu(p_vozac_id UUID, p_tura_id UUID)
RETURNS jsonb AS $$
DECLARE
  v_blokiran boolean;
  v_razlog text;
  v_ima_aktivnu_turu boolean;
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
  
  -- Proveri da li već ima aktivnu/dodeljenu turu
  SELECT EXISTS(
    SELECT 1 FROM prijave p
    JOIN ture t ON p.tura_id = t.id
    WHERE p.vozac_id = p_vozac_id
      AND p.status = 'odobreno'
      AND t.status IN ('dodeljena', 'aktivna')
  ) INTO v_ima_aktivnu_turu;
  
  IF v_ima_aktivnu_turu THEN
    RETURN jsonb_build_object(
      'moze', false,
      'razlog', 'Već imate aktivnu turu. Možete se prijaviti za novu nakon završetka trenutne ture.',
      'tip', 'aktivna_tura'
    );
  END IF;
  
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

-- Korak 4: Trigger koji proverava pre prijave
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

-- Korak 5: Indexi za brže upite
CREATE INDEX IF NOT EXISTS idx_prijave_odobreno_vozac 
ON public.prijave(vozac_id, status) 
WHERE status = 'odobreno';

CREATE INDEX IF NOT EXISTS idx_ture_datum_status 
ON public.ture(datum, status) 
WHERE status IN ('aktivna', 'dodeljena');

-- ========================================
-- KRAJ - Radi INSTANT bez cron job-a!
-- ========================================

-- Kako radi:
-- 1. Kada vozač pokuša da se prijavi za novu turu
-- 2. Funkcija automatski proverava sve njegove odobrene ture
-- 3. Ako neka tura nije završena a vreme je prošlo - BLOKIRA GA
-- 4. Tek onda proverava da li može da se prijavi
-- 
-- REZULTAT: Vozač se blokira INSTANT čim pokuša da se prijavi!
-- Nema čekanja, nema cron job-a!

