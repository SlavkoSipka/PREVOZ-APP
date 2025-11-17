-- =====================================================
-- FIX: Poslodavac ne vidi notifikacije - JOIN problem
-- =====================================================

-- **KORAK 1:** Test SELECT bez JOIN-ova
-- Prijavi se kao poslodavac i pokreni:

SELECT 
  id, 
  tip, 
  poruka, 
  procitano, 
  created_at, 
  tura_id,
  vozac_id
FROM notifikacije
WHERE vozac_id = 'POSLODAVAC-ID-OVDE'  -- ⚠️ Zameni!
ORDER BY created_at DESC;

-- ✅ Ako VIDIŠ notifikacije ovde, znači da su u bazi!
-- ❌ Ako NE VIDIŠ, notifikacije nisu kreirane

-- =====================================================
-- **KORAK 2:** Test SELECT sa JOIN-om na ture
-- =====================================================

SELECT 
  n.id, 
  n.tip, 
  n.poruka,
  t.polazak,
  t.destinacija
FROM notifikacije n
LEFT JOIN ture t ON n.tura_id = t.id
WHERE n.vozac_id = 'POSLODAVAC-ID-OVDE'  -- ⚠️ Zameni!
ORDER BY n.created_at DESC;

-- ✅ Ako VIDIŠ rezultate, JOIN radi
-- ❌ Ako NE VIDIŠ, problem je u RLS politikama za 'ture' tabelu

-- =====================================================
-- **KORAK 3:** Proveri RLS politike za 'ture' tabelu
-- =====================================================

SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'ture';

-- Traži politiku koja dozvoljava poslodavcu da vidi njegove ture:
-- ✅ GOOD: "firma_id = auth.uid()" ili slično
-- ❌ BAD: Ako nema SELECT politike za poslodavce!

-- =====================================================
-- **KORAK 4:** Proveri RLS politike za 'ocene' tabelu
-- =====================================================

SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'ocene';

-- Trebalo bi da poslodavac može da čita ocene
-- ✅ "Ocene su javno vidljive" ili slično

-- =====================================================
-- 🔧 PRIVREMENO REŠENJE: Koristi LEFT JOIN
-- =====================================================

-- Problem: Ako tura ne postoji ili RLS blokira, 
-- notifikacija se NE PRIKAZUJE!

-- Rešenje: App koristi LEFT JOIN, ali možda RLS blokira ture.

-- =====================================================
-- ✅ FIX: Dodaj RLS politiku za ture (SELECT za poslodavce)
-- =====================================================

-- Proveri da li postoji politika:
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'ture' 
AND cmd = 'SELECT'
AND policyname LIKE '%poslodavac%' OR policyname LIKE '%firma%';

-- Ako NE POSTOJI, kreiraj:

DROP POLICY IF EXISTS "Poslodavci mogu da vide svoje ture" ON public.ture;

CREATE POLICY "Poslodavci mogu da vide svoje ture"
ON public.ture
FOR SELECT
TO authenticated
USING (firma_id = auth.uid());

-- =====================================================
-- ✅ FIX: Osiguraj da ocene su javno vidljive
-- =====================================================

DROP POLICY IF EXISTS "Ocene su javno vidljive" ON public.ocene;

CREATE POLICY "Ocene su javno vidljive"
ON public.ocene
FOR SELECT
TO authenticated
USING (true);

-- =====================================================
-- **KORAK 5:** Test ponovo nakon FIX-a
-- =====================================================

-- Kao poslodavac:
SELECT 
  n.id, 
  n.tip, 
  n.poruka, 
  n.procitano, 
  n.created_at, 
  n.tura_id,
  t.polazak,
  t.destinacija,
  t.datum
FROM notifikacije n
LEFT JOIN ture t ON n.tura_id = t.id
WHERE n.vozac_id = auth.uid()
ORDER BY n.created_at DESC;

-- ✅ Sada bi trebalo da vidiš sve notifikacije!

-- =====================================================
-- 🎯 ALTERNATIVA: Uprosti query (bez JOIN-ova)
-- =====================================================

-- Ako join-ovi prave problem, možeš da učitavaš notifikacije
-- BEZ join-ova, a detalje tura učitavaš odvojeno po potrebi.

-- Jednostavna verzija:
SELECT 
  id, 
  tip, 
  poruka, 
  procitano, 
  created_at, 
  tura_id
FROM notifikacije
WHERE vozac_id = auth.uid()
ORDER BY created_at DESC;

-- ✅ Ovo SIGURNO radi ako je RLS politika za notifikacije OK

SELECT '🎉 Dijagnostika završena! Pokreni potrebne FIX-ove.' as status;

-- =====================================================
-- 📋 REZIME MOGUĆIH PROBLEMA:
-- =====================================================

/*
❌ PROBLEM 1: RLS politika za 'ture' ne dozvoljava poslodavcu SELECT
   SIMPTOM: Query vraća prazne rezultate
   FIX: Dodaj politiku "firma_id = auth.uid()"

❌ PROBLEM 2: LEFT JOIN sa 'ocene' faila
   SIMPTOM: Query vraća NULL ili prazan rezultat
   FIX: Osiguraj da 'ocene' su javno čitljive

❌ PROBLEM 3: Notifikacije nemaju tura_id pa JOIN vraća NULL
   SIMPTOM: Notifikacije sa tura_id=NULL se ne prikazuju
   FIX: LEFT JOIN bi trebalo da radi, ali proveri app logiku

❌ PROBLEM 4: Foreign key constraint blokira pristup
   SIMPTOM: Postgres odbija query zbog nedostatka permisija
   FIX: Dodaj RLS politike za sve povezane tabele
*/

