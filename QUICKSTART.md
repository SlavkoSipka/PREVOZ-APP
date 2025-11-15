# TransLink - Brzi Početak 🚀

Za **detaljna uputstva**, pogledajte [SETUP.md](./SETUP.md).

---

## ⚡ 5-minutni setup

### 1. Instalirajte zavisnosti
```bash
npm install
```

### 2. Kreirajte Supabase projekat
1. Idite na [supabase.com](https://supabase.com)
2. Kreirajte novi projekat
3. U SQL Editor izvršite `supabase/schema.sql`

### 3. Dodajte Environment Variables

Kreirajte `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vaš-projekat.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=vaš_anon_key
SUPABASE_SERVICE_ROLE_KEY=vaš_service_role_key

NEXT_PUBLIC_2CHECKOUT_MERCHANT_CODE=vaš_merchant_code
NEXT_PUBLIC_2CHECKOUT_SECRET_KEY=vaš_secret_key
TWOCHECKOUT_WEBHOOK_SECRET=vaš_webhook_secret

NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Pokrenite aplikaciju
```bash
npm run dev
```

Aplikacija: **http://localhost:3000**

---

## 🧪 Brzo testiranje

### 1. Kreirajte admin korisnika

U Supabase Dashboard → SQL Editor:

```sql
-- Prvo kreiraj korisnika u Authentication → Users, zatim:
UPDATE public.users 
SET uloga = 'admin' 
WHERE email = 'admin@test.rs';
```

### 2. Test Flow

**Firma:**
1. Registracija → `/registracija?uloga=firma`
2. Objavi turu → `/firma/objavi-turu`

**Vozač:**
1. Registracija → `/registracija?uloga=vozac`
2. Prihvati turu → Dashboard → Pogledaj turu → Prihvati

**Admin:**
1. Login → `/prijava`
2. Odobri vozača → Admin panel → Prijave vozača → Odobri

**Vozač (završetak):**
1. Login ponovo
2. Završi turu → Preusmeravanje na plaćanje

---

## 📂 Struktura Projekta

```
translink/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── firma/             # Firma dashboard
│   ├── vozac/             # Vozač dashboard
│   ├── api/webhook/       # 2Checkout webhook
│   └── page.tsx           # Početna stranica
├── components/            # React komponente
│   ├── ui/               # shadcn/ui komponente
│   ├── admin/            # Admin specifične
│   ├── vozac/            # Vozač specifične
│   └── dashboard/        # Zajedničke
├── lib/                   # Utility funkcije
│   ├── supabase/         # Supabase klijenti
│   └── auth-helpers.ts   # Auth funkcije
├── supabase/
│   └── schema.sql        # Database schema
└── types/                 # TypeScript tipovi
```

---

## 🎯 Funkcionalnosti

### ✅ Za Vozače
- Pregled dostupnih tura
- Prihvatanje tura
- Plaćanje provizije (15€)
- Profil i notifikacije

### ✅ Za Firme
- Objavljivanje tura
- Pregled prijavljenih vozača
- Praćenje statusa tura
- Kontakt sa vozačima

### ✅ Za Admine
- Odobravanje vozača
- Upravljanje korisnicima
- Pregled uplata
- Sistemska kontrola

---

## 🔗 Korisni Linkovi

- **Setup Guide:** [SETUP.md](./SETUP.md)
- **Deployment:** [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Features:** [FEATURES.md](./FEATURES.md)
- **SQL Schema:** [supabase/schema.sql](./supabase/schema.sql)

---

## 🆘 Česte Greške

**Problem:** "Cannot find Supabase URL"  
**Rešenje:** Proverite `.env.local` fajl

**Problem:** "RLS policy violation"  
**Rešenje:** Izvršite kompletan `schema.sql`

**Problem:** "Cannot read properties of null (reading 'uloga')"  
**Rešenje:** Korisnik nije pravilno kreiran u bazi. Izvršite:
```sql
-- U Supabase Dashboard → SQL Editor
-- Zameni 'vaš@email.rs' sa pravim email-om
INSERT INTO public.users (id, email, puno_ime, uloga, telefon)
SELECT 
  au.id, au.email,
  COALESCE(au.raw_user_meta_data->>'puno_ime', 'Korisnik'),
  COALESCE(au.raw_user_meta_data->>'uloga', 'vozac'),
  COALESCE(au.raw_user_meta_data->>'telefon', '000000000')
FROM auth.users au
WHERE au.email = 'vaš@email.rs'
  AND NOT EXISTS (SELECT 1 FROM public.users WHERE id = au.id);
```

**Problem:** Webhook ne radi  
**Rešenje:** Webhook-ovi ne rade na localhost-u. Koristite ngrok ili deploy na Vercel.

---

## 📞 Pomoć

Za detaljnija uputstva i troubleshooting:
- [SETUP.md](./SETUP.md) - Kompletan setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- Supabase Logs - Za backend greške
- Browser Console - Za frontend greške

---

Srećan rad! 🚚✨

