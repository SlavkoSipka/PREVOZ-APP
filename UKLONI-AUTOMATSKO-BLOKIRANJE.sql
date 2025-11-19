-- ================================================
-- UKLANJANJE AUTOMATSKOG BLOKIRANJA VOZAČA
-- ================================================
-- Ovaj script uklanja sve automatske funkcije za blokiranje
-- Ali ZADRŽAVA manuelnu mogućnost za admina da blokira korisnike
-- ================================================

-- 1. OBRIŠI SVE AUTOMATSKE FUNKCIJE
-- ================================================

-- Funkcija koja automatski blokira vozača
DROP FUNCTION IF EXISTS auto_blokiraj_vozaca_za_odbijenu_turu() CASCADE;

-- Funkcija koja proverava i blokira vozača za specifičnu turu
DROP FUNCTION IF EXISTS proveri_i_blokiraj_vozaca(UUID, UUID) CASCADE;

-- Funkcija koja proverava sve odobrene ture vozača
DROP FUNCTION IF EXISTS proveri_sve_odobrene_ture_vozaca(UUID) CASCADE;

-- Funkcija koja proverava da li vozač može da se prijavi (ako sadrži automatsku proveru)
-- NAPOMENA: Ovu funkciju možda treba modifikovati umesto da se briše,
-- jer možda sadrži i drugu logiku osim blokiranja
DROP FUNCTION IF EXISTS moze_se_prijaviti_na_turu(UUID, UUID) CASCADE;

-- Trigger koji poziva automatsku proveru pre prijave
DROP TRIGGER IF EXISTS trigger_proveri_vozaca_pre_prijave ON public.prijave;
DROP FUNCTION IF EXISTS proveri_vozaca_pre_prijave() CASCADE;

-- 2. OBRIŠI PG_CRON JOB AKO POSTOJI
-- ================================================

DO $$
BEGIN
  -- Proverite da li pg_cron extension postoji
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Obrišite job ako postoji
    IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'auto-blokiraj-vozace') THEN
      PERFORM cron.unschedule('auto-blokiraj-vozace');
      RAISE NOTICE '✅ Obrisan pg_cron job: auto-blokiraj-vozace';
    END IF;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE '⚠️ Nije mogao da obriše pg_cron job (možda ne postoji)';
END $$;

-- 3. ZADRŽAVAMO KOLONE U TABELAMA
-- ================================================
-- Kolone blokiran, razlog_blokiranja, vreme_automatske_blokade
-- se ZADRŽAVAJU jer će admin koristiti za MANUELNO blokiranje!

-- 4. PROVERA: Vidi koje funkcije još postoje
-- ================================================

SELECT 
  proname as funkcija_ime,
  pg_get_function_arguments(oid) as argumenti
FROM pg_proc
WHERE proname LIKE '%blok%'
   OR proname LIKE '%proveri%tur%'
   OR proname LIKE '%moze_se_prijaviti%';

-- ================================================
-- ✅ GOTOVO!
-- ================================================
-- Sve automatske funkcije su obrisane.
-- Admin i dalje može MANUELNO da blokira korisnike kroz UI
-- koristeći postojeće RLS politike iz FIX-ADMIN-UPDATE-BLOKIRAN.sql
-- ================================================

