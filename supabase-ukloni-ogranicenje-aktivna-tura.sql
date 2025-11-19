-- ========================================
-- ⚠️ OVAJ FAJL JE ZASTAREO!
-- ========================================
-- Automatske funkcije za blokiranje su UKLONJENE!
-- Koristi umesto ovog: UKLONI-AUTOMATSKO-BLOKIRANJE.sql
-- ========================================

-- OVAJ KOD JE ZASTAREO - NE KORISTI GA!
-- CREATE OR REPLACE FUNCTION moze_se_prijaviti_na_turu(p_vozac_id UUID, p_tura_id UUID)
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
-- GOTOVO!
-- ========================================
-- Vozači sada mogu da se prijavljuju za više tura istovremeno.
-- Jedina preostala ograničenja su:
-- 1. Ne mogu se prijaviti ako je nalog blokiran
-- 2. Ne mogu se ponovo prijaviti za turu na koju su već odbijeni
-- 3. Ne mogu se dvaput prijaviti za istu turu

