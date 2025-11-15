-- ========================================
-- SISTEM BLOKIRANJA VOZAČA - SUPABASE PG_CRON
-- ========================================
-- Ovo je FINALNO rešenje koje radi potpuno automatski
-- bez eksternih servisa ili API-ja!
-- ========================================

-- Korak 1: Dodaj nove kolone
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS razlog_blokiranja TEXT,
ADD COLUMN IF NOT EXISTS vreme_automatske_blokade TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.prijave 
ADD COLUMN IF NOT EXISTS razlog_odbijanja TEXT;

-- Korak 2: Kreiraj funkciju za automatsko blokiranje
CREATE OR REPLACE FUNCTION auto_blokiraj_vozaca_za_odbijenu_turu()
RETURNS void AS $$
DECLARE
  prijava_record RECORD;
  v_blokirano_vozaca INT := 0;
BEGIN
  -- Pronađi sve odobrene ture gde je prošlo vreme i vozač NIJE završio turu
  FOR prijava_record IN
    SELECT 
      p.id as prijava_id,
      p.vozac_id,
      t.id as tura_id,
      t.datum,
      t.vreme_polaska,
      t.polazak,
      t.destinacija,
      t.status as tura_status
    FROM prijave p
    JOIN ture t ON p.tura_id = t.id
    JOIN users u ON p.vozac_id = u.id
    WHERE p.status = 'odobreno'
      AND u.blokiran = false
      AND t.status IN ('aktivna', 'dodeljena')  -- Nije završena
      AND t.datum <= CURRENT_DATE
      AND (
        -- Ako ima vreme polaska, proveri da li je prošlo
        (t.vreme_polaska IS NOT NULL AND 
         CONCAT(t.datum::text, ' ', t.vreme_polaska)::timestamp + INTERVAL '1 hour' <= NOW())
        OR
        -- Ako nema vreme polaska, blokiraj dan nakon datuma ture
        (t.vreme_polaska IS NULL AND t.datum < CURRENT_DATE)
      )
  LOOP
    -- Blokiraj vozača
    UPDATE public.users
    SET 
      blokiran = true,
      razlog_blokiranja = '⚠️ Automatski blokiran - niste izvezli odobrenu turu: ' || 
                         prijava_record.polazak || ' → ' || prijava_record.destinacija ||
                         ' (datum: ' || prijava_record.datum || 
                         CASE WHEN prijava_record.vreme_polaska IS NOT NULL 
                              THEN ', vreme: ' || prijava_record.vreme_polaska 
                              ELSE '' END || '). ' ||
                         'Morate platiti proviziju da bi se nalog deblokirao.',
      vreme_automatske_blokade = NOW()
    WHERE id = prijava_record.vozac_id;
    
    -- Kreiraj notifikaciju
    INSERT INTO public.notifikacije (user_id, naslov, poruka)
    VALUES (
      prijava_record.vozac_id,
      '⚠️ Nalog je automatski blokiran',
      'Vaš nalog je blokiran jer niste izvezli odobrenu turu (' || 
      prijava_record.polazak || ' → ' || prijava_record.destinacija || 
      '). Morate platiti proviziju da bi se nalog deblokirao. Kontaktirajte administratora za više informacija.'
    );
    
    v_blokirano_vozaca := v_blokirano_vozaca + 1;
    
    -- Log za admin
    RAISE NOTICE 'Blokiran vozač ID: %, Tura: % → %', 
      prijava_record.vozac_id, 
      prijava_record.polazak, 
      prijava_record.destinacija;
  END LOOP;
  
  -- Log ukupno blokiranih
  IF v_blokirano_vozaca > 0 THEN
    RAISE NOTICE 'Ukupno blokirano vozača: %', v_blokirano_vozaca;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Korak 3: Kreiraj funkciju za proveru da li vozač može da se prijavi
CREATE OR REPLACE FUNCTION moze_se_prijaviti_na_turu(p_vozac_id UUID, p_tura_id UUID)
RETURNS jsonb AS $$
DECLARE
  v_blokiran boolean;
  v_razlog text;
  v_ima_aktivnu_turu boolean;
  v_vec_prijavljen boolean;
  v_status_prijave text;
BEGIN
  -- Proveri da li je vozač blokiran
  SELECT blokiran, razlog_blokiranja
  INTO v_blokiran, v_razlog
  FROM users
  WHERE id = p_vozac_id;
  
  IF v_blokiran THEN
    RETURN jsonb_build_object(
      'moze', false,
      'razlog', 'Vaš nalog je blokiran. ' || COALESCE(v_razlog, 'Kontaktirajte administratora za više informacija.'),
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

-- Korak 5: Index za brže pronalaženje
CREATE INDEX IF NOT EXISTS idx_prijave_odobreno_vozac 
ON public.prijave(vozac_id, status) 
WHERE status = 'odobreno';

CREATE INDEX IF NOT EXISTS idx_ture_datum_status 
ON public.ture(datum, status) 
WHERE status IN ('aktivna', 'dodeljena');

-- ========================================
-- KORAK 6: SUPABASE PG_CRON - AUTOMATSKO POKRETANJE
-- ========================================

-- Omogući pg_cron extension (samo jednom)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Obriši stari job ako postoji (bezbedno)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'auto-blokiraj-vozace') THEN
    PERFORM cron.unschedule('auto-blokiraj-vozace');
  END IF;
END $$;

-- Zakaži funkciju da se pokreće svakih 10 minuta
SELECT cron.schedule(
  'auto-blokiraj-vozace',              -- Ime job-a
  '*/10 * * * *',                      -- Svakih 10 minuta
  $$ SELECT auto_blokiraj_vozaca_za_odbijenu_turu(); $$
);

-- Proveri da li je job kreiran
SELECT jobid, schedule, command, nodename, nodeport, database, username, active
FROM cron.job
WHERE jobname = 'auto-blokiraj-vozace';

-- ========================================
-- KRAJ - SVE JE AUTOMATSKI!
-- ========================================

-- Test: Možeš ručno pozvati funkciju:
-- SELECT auto_blokiraj_vozaca_za_odbijenu_turu();

-- Proveri logove:
-- SELECT * FROM cron.job_run_details 
-- WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'auto-blokiraj-vozace')
-- ORDER BY start_time DESC 
-- LIMIT 10;

