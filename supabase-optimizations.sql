-- ========================================
-- PERFORMANCE OPTIMIZATIONS - Supabase
-- ========================================
-- Ova skripta dodaje sve potrebne indekse za brže učitavanje

-- Composite indexi za česte JOIN-ove i WHERE upite
CREATE INDEX IF NOT EXISTS idx_ture_firma_status ON public.ture(firma_id, status);
CREATE INDEX IF NOT EXISTS idx_ture_status_datum ON public.ture(status, datum);
CREATE INDEX IF NOT EXISTS idx_ture_dodeljeni_vozac ON public.ture(dodeljeni_vozac_id) WHERE dodeljeni_vozac_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_prijave_vozac_status ON public.prijave(vozac_id, status);
CREATE INDEX IF NOT EXISTS idx_prijave_tura_status ON public.prijave(tura_id, status);
CREATE INDEX IF NOT EXISTS idx_prijave_vozac_created ON public.prijave(vozac_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_uplate_vozac_status ON public.uplate(vozac_id, status);
CREATE INDEX IF NOT EXISTS idx_uplate_tura_vozac ON public.uplate(tura_id, vozac_id);

CREATE INDEX IF NOT EXISTS idx_notifikacije_user_procitano ON public.notifikacije(user_id, procitano);
CREATE INDEX IF NOT EXISTS idx_notifikacije_user_created ON public.notifikacije(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_users_uloga_blokiran ON public.users(uloga, blokiran);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Analyzing tabela za optimizaciju query plana
ANALYZE public.ture;
ANALYZE public.prijave;
ANALYZE public.uplate;
ANALYZE public.notifikacije;
ANALYZE public.users;

-- ========================================
-- KRAJ
-- ========================================

