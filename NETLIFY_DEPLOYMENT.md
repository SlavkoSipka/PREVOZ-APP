# TransLink - Netlify Deployment Guide

## 🚀 Deployment na Netlify preko GitHub-a

### Korak 1: Priprema GitHub Repository-ja

#### 1.1 Inicijalizuj Git i push na GitHub

```bash
# Inicijalizacija git repository-ja
git init

# Dodaj sve fajlove
git add .

# Commit
git commit -m "Initial commit - TransLink aplikacija"

# Dodaj GitHub remote (zameni sa svojim repo URL-om)
git remote add origin https://github.com/vaskorisnicko/translink.git

# Push na GitHub
git branch -M main
git push -u origin main
```

#### 1.2 Kreiraj .gitignore (već postoji u projektu)

Proveri da `.gitignore` sadrži:
```
node_modules/
.next/
.env.local
.env
```

---

### Korak 2: Kreiranje Netlify Projekta

#### 2.1 Povežite GitHub sa Netlify-em

1. Idite na [netlify.com](https://netlify.com)
2. Kliknite **"Add new site"** → **"Import an existing project"**
3. Izaberite **GitHub**
4. Autorizujte Netlify pristup vašem GitHub nalogu
5. Izaberite `translink` repository

#### 2.2 Build Settings

Netlify će automatski detektovati Next.js projekat. Proverite da su sledeća podešavanja tačna:

- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Functions directory:** `netlify/functions` (opciono)

---

### Korak 3: Environment Variables

U Netlify dashboard-u, dodajte sledeće environment varijable:

#### Supabase Variables (OBAVEZNO)

```
NEXT_PUBLIC_SUPABASE_URL=https://vašprojekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=vaš_anon_key
SUPABASE_SERVICE_ROLE_KEY=vaš_service_role_key
```

#### Site Configuration (OBAVEZNO)

```
NEXT_PUBLIC_SITE_URL=https://translink.netlify.app
```
*Zamenite sa vašim Netlify URL-om nakon deployment-a*

#### Test Mode (OBAVEZNO za početak)

```
NEXT_PUBLIC_TEST_MODE=true
```
*Postavite na `false` kada budete spremni za pravo plaćanje*

#### 2Checkout Variables (OPCIONO - samo za produkciju)

```
# Dodajte ovo samo kada ste spremni za pravu integraciju
NEXT_PUBLIC_2CHECKOUT_MERCHANT_CODE=vaš_merchant_code
NEXT_PUBLIC_2CHECKOUT_SECRET_KEY=vaš_secret_key
TWOCHECKOUT_WEBHOOK_SECRET=vaš_webhook_secret
```

---

### Korak 4: Deploy

1. Kliknite **"Deploy site"**
2. Sačekajte da se build završi (3-5 minuta)
3. Proverite deployment URL (npr. `https://translink.netlify.app`)

---

### Korak 5: Post-Deployment Konfiguracija

#### 5.1 Ažurirajte Supabase Auth URLs

U Supabase dashboard-u:

1. Idite na **Authentication** → **URL Configuration**
2. Dodajte u **Redirect URLs**:
   ```
   https://translink.netlify.app/prijava
   https://translink.netlify.app/
   https://translink.netlify.app/auth/callback
   ```

3. **Site URL:**
   ```
   https://translink.netlify.app
   ```

#### 5.2 Ažurirajte Environment Variable

Vratite se u Netlify → Site settings → Environment variables:
- Ažurirajte `NEXT_PUBLIC_SITE_URL` sa pravim production URL-om
- Kliknite **"Redeploy"** da primeni izmene

---

## 🧪 Test Mode (Mock Plaćanje)

### Šta je Test Mode?

Test mode omogućava kompletno testiranje aplikacije **bez pravih plaćanja**. Sve je funkcionalno, ali plaćanje je simulirano.

### Kako radi?

1. **Environment variable:** `NEXT_PUBLIC_TEST_MODE=true`
2. Vozač završi turu → nalog se blokira
3. Prikaže se dugme **"🧪 Simuliraj plaćanje (TEST MODE)"**
4. Klik na dugme **automatski**:
   - Označava uplate kao plaćene
   - Odblokira nalog
   - Kreira notifikaciju
5. Vozač može nastaviti korišćenje

### Kada isključiti Test Mode?

Kada ste spremni za pravo plaćanje:

1. Registrujte se na [2checkout.com](https://www.2checkout.com)
2. Dobijte merchant code i API keys
3. U Netlify environment variables:
   ```
   NEXT_PUBLIC_TEST_MODE=false
   NEXT_PUBLIC_2CHECKOUT_MERCHANT_CODE=vaš_code
   NEXT_PUBLIC_2CHECKOUT_SECRET_KEY=vaš_key
   TWOCHECKOUT_WEBHOOK_SECRET=vaš_secret
   ```
4. Redeploy aplikaciju
5. Konfigurirajte 2Checkout webhook (videti ispod)

---

## 💳 2Checkout Integracija (Kada ste spremni)

### Setup 2Checkout-a

1. **Registracija:** [2checkout.com](https://www.2checkout.com)
2. **Verifikacija:** Može trajati nekoliko dana
3. **API Credentials:**
   - Idite na **Integrations** → **Webhooks & API**
   - Kopirajte Merchant Code
   - Generišite API key

### Webhook Konfiguracija

1. U 2Checkout dashboard-u:
   - Idite na **Integrations** → **Webhooks**
   - Dodajte webhook URL:
     ```
     https://translink.netlify.app/api/webhook/2checkout
     ```
   - Omogućite notifikacije:
     - `ORDER_CREATED`
     - `PAYMENT_RECEIVED`
   - Sačuvajte Webhook Secret

2. Dodajte u Netlify environment variables:
   ```
   TWOCHECKOUT_WEBHOOK_SECRET=vaš_webhook_secret
   ```

3. Isključite test mode:
   ```
   NEXT_PUBLIC_TEST_MODE=false
   ```

4. Redeploy aplikaciju

---

## 🔄 Continuous Deployment

Netlify automatski re-deploy-uje aplikaciju na svaki push na `main` branch:

```bash
# Napravite izmene
git add .
git commit -m "Opis izmena"
git push origin main

# Netlify automatski počinje novi build
```

### Branch Previews

Možete kreirati preview deploymente za druge branch-eve:

```bash
# Kreirajte dev branch
git checkout -b dev

# Push na GitHub
git push origin dev

# Netlify automatski kreira preview URL
```

---

## 🎨 Custom Domain (Opciono)

### Setup Custom Domain-a

1. U Netlify → **Domain settings**
2. Kliknite **"Add custom domain"**
3. Unesite domen (npr. `translink.rs`)
4. Pratite uputstva za DNS konfiguraciju
5. Netlify automatski dodaje SSL sertifikat

### DNS Podešavanja

Dodajte kod domen registrara:

**Ako koristite subdomen (www.translink.rs):**
```
CNAME www your-site.netlify.app
```

**Ako koristite root domen (translink.rs):**
```
A @ 75.2.60.5
AAAA @ 2a05:d014:edb:5702::6
```

---

## 🐛 Troubleshooting

### Build Failed

**Problem:** Build nije uspeo  
**Rešenje:**
1. Proverite Netlify build logs
2. Pokrenite `npm run build` lokalno
3. Proverite da su sve dependencies instalirane

### Environment Variables ne rade

**Problem:** Aplikacija ne može pročitati env varijable  
**Rešenje:**
1. Proverite nazive varijabli (case-sensitive)
2. Sve varijable moraju početi sa `NEXT_PUBLIC_` za client-side
3. Nakon izmene env vars, obavezno **Redeploy**

### 404 Error na rutama

**Problem:** 404 greška na dinamičkim rutama  
**Rešenje:**
1. Proverite `netlify.toml` fajl
2. Proveri da li je `@netlify/plugin-nextjs` plugin instaliran

### Test Mode ne radi

**Problem:** Test plaćanje ne funkcioniše  
**Rešenje:**
1. Proverite da je `NEXT_PUBLIC_TEST_MODE=true`
2. Proverite browser console za greške
3. Proverite Netlify Functions logs

---

## 📊 Monitoring i Analytics

### Netlify Analytics

Aktivirajte u Netlify dashboard-u:
- **Site settings** → **Analytics**
- Pratite traffic, performance i errors

### Function Logs

Pristupite logs-ima:
- **Functions** tab u Netlify dashboard-u
- Real-time monitoring API calls-ova

---

## ✅ Pre-Launch Checklist

Pre nego što pustite aplikaciju u produkciju:

- [ ] GitHub repo kreiran i push-ovan
- [ ] Netlify projekat kreiran i povezan
- [ ] Sve environment variables postavljene
- [ ] Supabase projekat kreiran i SQL schema izvršena
- [ ] Supabase redirect URLs ažurirani
- [ ] `NEXT_PUBLIC_SITE_URL` ažuriran sa production URL-om
- [ ] Test mode AKTIVAN (`NEXT_PUBLIC_TEST_MODE=true`)
- [ ] Aplikacija testirana u test modu
- [ ] Custom domen podešen (ako koristite)
- [ ] SSL sertifikat aktivan (automatski na Netlify)

### Kada ste spremni za produkciju:

- [ ] 2Checkout nalog verifikovan
- [ ] 2Checkout credentials dodati
- [ ] Webhook konfigurisan u 2Checkout-u
- [ ] Test mode ISKLJUČEN (`NEXT_PUBLIC_TEST_MODE=false`)
- [ ] Kompletan flow testiran sa pravim plaćanjem (test kartice)

---

## 🔐 Sigurnost

### Environment Variables

- ✅ Nikada ne commitujte `.env.local`
- ✅ Sve secrets samo u Netlify environment variables
- ✅ Rótirajte ključeve periodično

### Webhook Security

Kada dodate pravi 2Checkout webhook, endpoint `/api/webhook/2checkout` validira signature-e za sigurnost.

---

## 💡 Saveti

1. **Koristite Test Mode** dok ne budete 100% sigurni da sve radi
2. **Testirajte lokalno** pre svakog push-a na GitHub
3. **Koristite branch-eve** za nove feature-e
4. **Redeploy nakon izmena** environment variables
5. **Pratite logs** u Netlify dashboard-u

---

**Deployment Workflow:**

```
Lokalno razvijanje → Git commit → Push na GitHub → 
Netlify auto-build → Test na preview URL → 
Merge u main → Production deploy → Profit! 🎉
```

---

Vaša aplikacija je sada spremna za deployment na Netlify! 🚀

