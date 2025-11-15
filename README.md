# TransLink - Platforma za povezivanje firmi i vozača

TransLink je moderna web aplikacija koja povezuje firme koje imaju robu za prevoz sa profesionalnim vozačima kamiona.

> **👉 POČNITE OVDE:** [START_HERE.md](./START_HERE.md)  
> **⚡ BRZI START:** [QUICKSTART.md](./QUICKSTART.md)  
> **🧪 TEST MODE:** [TEST_MODE_GUIDE.md](./TEST_MODE_GUIDE.md)  
> **🌐 NETLIFY:** [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)

## 🚀 Tehnologije

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **UI Komponente**: shadcn/ui + Radix UI
- **Backend**: Supabase (Auth, Database, Storage, Functions)
- **Plaćanje**: 2Checkout
- **Hosting**: Vercel + Supabase Cloud

## 📋 Funkcionalnosti

### Za Firme
- Registracija i verifikacija naloga
- Objavljivanje tura za transport
- Pregled statusa tura
- Komunikacija sa vozačima

### Za Vozače
- Registracija i verifikacija naloga
- Pregled dostupnih tura
- Prijava na ture
- Plaćanje provizije nakon završene ture

### Za Admine
- Odobravanje vozača za ture
- Praćenje uplata
- Upravljanje korisnicima
- Statistike i izveštaji

## 🛠️ Instalacija

### 1. Klonirajte projekat

```bash
git clone <repository-url>
cd translink
```

### 2. Instalirajte zavisnosti

```bash
npm install
```

### 3. Supabase Setup

1. Kreirajte novi projekat na [Supabase](https://supabase.com)
2. U Supabase SQL Editor, izvršite `supabase/schema.sql`
3. Kopirajte Supabase URL i anon key

### 4. Environment Variables

Kreirajte `.env.local` fajl:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# 2Checkout
NEXT_PUBLIC_2CHECKOUT_MERCHANT_CODE=your_merchant_code
NEXT_PUBLIC_2CHECKOUT_SECRET_KEY=your_secret_key
TWOCHECKOUT_WEBHOOK_SECRET=your_webhook_secret
```

### 5. Pokrenite development server

```bash
npm run dev
```

Aplikacija će biti dostupna na [http://localhost:3000](http://localhost:3000)

## 📊 Baza Podataka

### Tabele

- **users** - Korisnici aplikacije (vozači, firme, admin)
- **ture** - Objavljene ture za transport
- **prijave** - Prijave vozača na ture
- **uplate** - Evidencija uplata provizije
- **notifikacije** - Sistemske notifikacije

### Row Level Security (RLS)

Svi podaci su zaštićeni sa Supabase RLS politikama koje osiguravaju da:
- Vozači mogu videti samo svoje podatke
- Firme mogu upravljati samo svojim turama
- Admin ima pristup svim podacima

## 🔐 Autentifikacija

Aplikacija koristi Supabase Auth sa role-based routing:
- `/vozac/*` - Dostupno samo vozačima
- `/firma/*` - Dostupno samo firmama
- `/admin/*` - Dostupno samo adminima

## 💳 Plaćanje

Integracija sa 2Checkout:
1. Vozač završi turu i označi je kao gotovu
2. Iskoči popup za plaćanje provizije (15 €)
3. Preusmeravanje na 2Checkout checkout link
4. Webhook potvrđuje uplatu i odblokira nalog

## 🚀 Deployment

### Vercel

```bash
npm run build
vercel --prod
```

### Environment Variables na Vercelu

Dodajte sve environment varijable iz `.env.local` u Vercel dashboard.

## 📝 Napomene

- Provizija vozača je podešena na 15 € po turi
- Dok vozač ne plati proviziju, nalog mu je blokiran
- Sve poruke i UI su na srpskom jeziku
- Aplikacija je responsive i radi na svim uređajima

## 🤝 Podrška

Za pitanja i podršku, kontaktirajte admin tim.

## 📄 Licenca

Privatna aplikacija - sva prava zadržana.

