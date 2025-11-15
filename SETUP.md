# TransLink - Uputstvo za pokretanje

Ovaj dokument sadrži detaljna uputstva za pokretanje TransLink aplikacije.

## 📋 Preduslov

Pre nego što počnete, potrebno je da imate instalirano:
- **Node.js** (verzija 18 ili novija)
- **npm** ili **pnpm**
- **Supabase** nalog (besplatan)
- **2Checkout** nalog (za plaćanja)

---

## 🚀 Korak po korak setup

### 1. Instalacija zavisnosti

```bash
npm install
```

### 2. Supabase Setup

#### 2.1 Kreiranje Supabase projekta

1. Idite na [https://supabase.com](https://supabase.com)
2. Kreirajte novi projekat
3. Sačekajte da se projekat inicijalizuje (2-3 minuta)

#### 2.2 Izvršavanje SQL šeme

1. U Supabase dashboard-u, idite na **SQL Editor**
2. Otvorite fajl `supabase/schema.sql` iz ovog projekta
3. Kopirajte ceo sadržaj i nalepite u SQL Editor
4. Kliknite **Run** da izvršite SQL komande
5. Proverite da su sve tabele kreirane u **Table Editor** sekciji

#### 2.3 Uzimanje kredencijala

1. Idite na **Project Settings** → **API**
2. Kopirajte:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon/public key** (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role key** (SUPABASE_SERVICE_ROLE_KEY)

### 3. Environment Variables

Kreirajte `.env.local` fajl u root direktorijumu:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vashprojekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=vaš_anon_key
SUPABASE_SERVICE_ROLE_KEY=vaš_service_role_key

# 2Checkout
NEXT_PUBLIC_2CHECKOUT_MERCHANT_CODE=vaš_merchant_code
NEXT_PUBLIC_2CHECKOUT_SECRET_KEY=vaš_secret_key
TWOCHECKOUT_WEBHOOK_SECRET=vaš_webhook_secret

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. 2Checkout Setup

#### 4.1 Kreiranje naloga

1. Registrujte se na [https://www.2checkout.com](https://www.2checkout.com)
2. Verifikujte nalog
3. Idite na **Integrations** → **Webhooks & API**

#### 4.2 Konfiguracija webhook-a

1. Dodajte webhook URL: `https://vasa-domena.com/api/webhook/2checkout`
2. Omogućite notifikacije za:
   - ORDER_CREATED
   - PAYMENT_RECEIVED
3. Sačuvajte **Webhook Secret**

### 5. Kreiranje Admin korisnika

Nakon što pokrenete aplikaciju, potrebno je kreirati admin korisnika:

#### Opcija 1: Kroz Supabase Dashboard

1. Idite na **Authentication** → **Users**
2. Kliknite **Add user**
3. Unesite email i lozinku
4. Nakon kreiranja, idite na **Table Editor** → **users**
5. Pronađite novog korisnika i promenite `uloga` na `admin`

#### Opcija 2: Kroz SQL

```sql
-- Prvo kreiraj auth korisnika kroz Supabase Dashboard, zatim:
UPDATE public.users 
SET uloga = 'admin' 
WHERE email = 'admin@translink.rs';
```

### 6. Pokretanje aplikacije

```bash
npm run dev
```

Aplikacija će biti dostupna na: **http://localhost:3000**

---

## 🧪 Testiranje aplikacije

### Testiranje registracije

1. **Vozač registracija:**
   - Idite na `/registracija?uloga=vozac`
   - Popunite formu
   - Proverite email za verifikaciju

2. **Firma registracija:**
   - Idite na `/registracija?uloga=firma`
   - Popunite formu
   - Proverite email za verifikaciju

### Testiranje toka ture

1. **Prijava kao firma:**
   - Prijavite se sa firma nalogom
   - Kreirajte novu turu na `/firma/objavi-turu`

2. **Prijava kao vozač:**
   - Prijavite se sa vozač nalogom
   - Pronađite turu i kliknite "Prihvati turu"

3. **Odobravanje kao admin:**
   - Prijavite se kao admin
   - Idite na **Prijave vozača** tab
   - Odobrite vozača za turu

4. **Završavanje ture:**
   - Prijavite se ponovo kao vozač
   - Kliknite "Završio sam turu"
   - Biće preusmereni na stranicu za plaćanje

---

## 🔧 Česte greške i rešenja

### Greška: "Cannot find Supabase URL"

**Rešenje:** Proverite da li ste kreirali `.env.local` fajl i da su varijable ispravno postavljene.

### Greška: "RLS policy violation"

**Rešenje:** Proverite da li ste izvršili ceo `schema.sql` fajl. RLS politike moraju biti kreirane.

### Greška: "User metadata not found"

**Rešenje:** Proverite da li je `handle_new_user` trigger kreiran u bazi.

### Webhook ne radi

**Rešenje:** 
1. Proverite da li je aplikacija deployovana (webhook-ovi ne rade na localhost-u)
2. Koristite ngrok za testiranje lokalno: `ngrok http 3000`
3. Ažurirajte webhook URL u 2Checkout sa ngrok URL-om

---

## 📦 Deployment

### Vercel Deployment

```bash
# Instalirajte Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment varijable na Vercel-u

1. Idite na Vercel dashboard
2. Project Settings → Environment Variables
3. Dodajte sve varijable iz `.env.local`

### Post-deployment

1. Ažurirajte `NEXT_PUBLIC_SITE_URL` sa production URL-om
2. Ažurirajte 2Checkout webhook URL sa production URL-om
3. Testirajte ceo tok aplikacije

---

## 📞 Podrška

Ako naiđete na probleme, proverite:
1. Supabase logs (Dashboard → Logs)
2. Vercel logs (Deployment → Logs)
3. Browser console za frontend greške

---

## ✅ Checklist pre puštanja u produkciju

- [ ] Supabase projekat kreiran i SQL šema izvršena
- [ ] Svi environment variables postavljeni
- [ ] Admin korisnik kreiran
- [ ] 2Checkout nalog verifikovan
- [ ] Webhook testiran i radi
- [ ] Testiran kompletan tok: registracija → tura → odobrenje → plaćanje
- [ ] Aplikacija deployovana
- [ ] SSL sertifikat aktivan
- [ ] Email notifikacije testiranje
- [ ] Responsive dizajn proveren na mobilnim uređajima

---

Srećan rad sa TransLink platformom! 🚚✨

