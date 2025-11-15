-- ========================================
-- 🚀 OMOGUĆAVANJE REALTIME FUNKCIONALNOSTI
-- ========================================
-- Ova skripta omogućava real-time subscriptions za ture i prijave
-- Pokreni ovu skriptu u Supabase SQL Editor-u
-- ========================================

-- Omogući realtime za tabelu 'ture'
ALTER PUBLICATION supabase_realtime ADD TABLE public.ture;

-- Omogući realtime za tabelu 'prijave'
ALTER PUBLICATION supabase_realtime ADD TABLE public.prijave;

-- Omogući realtime za tabelu 'users' (za promene statusa korisnika)
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- Omogući realtime za tabelu 'notifikacije'
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifikacije;

-- Omogući realtime za tabelu 'uplate'
ALTER PUBLICATION supabase_realtime ADD TABLE public.uplate;

-- ========================================
-- ✅ PROVERA - Da li je realtime omogućen
-- ========================================
-- Pokreni ovaj upit da proveriš koje tabele imaju realtime:

SELECT 
    schemaname,
    tablename
FROM 
    pg_publication_tables
WHERE 
    pubname = 'supabase_realtime'
ORDER BY 
    tablename;

-- ========================================
-- 📝 NAPOMENA
-- ========================================
-- Nakon pokretanja ove skripte, real-time će biti omogućen
-- za sledeće tabele:
-- - ture (sve promene će biti vidljive uživo)
-- - prijave (nova prijava, odobrenje, odbijanje)
-- - users (promene statusa korisnika)
-- - notifikacije (nove notifikacije)
-- - uplate (status plaćanja)
-- ========================================

