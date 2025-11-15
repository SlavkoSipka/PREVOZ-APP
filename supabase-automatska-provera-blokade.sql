-- ========================================
-- AUTOMATSKA PROVERA I BLOKIRANJE VOZAČA
-- ========================================
-- Ova funkcija proverava sve odobrene ture vozača i blokira ga ako je propustio neku.

-- Korak 1: Ispravi funkciju proveri_i_blokiraj_vozaca da ne ubacuje notifikacije
-- (jer su notifikacije sada u novoj strukturi)
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
    -- Proveri da li je prošlo dovoljno vremena
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

-- Korak 2: Kreiraj novu funkciju koja proverava SVE odobrene ture vozača
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
-- GOTOVO!
-- ========================================
-- Kako koristiti:
-- 1. Frontend poziva proveri_sve_odobrene_ture_vozaca(vozac_id) na učitavanju dashboarda
-- 2. Funkcija automatski proverava sve odobrene ture
-- 3. Ako je neka tura propuštena, vozač se automatski blokira

