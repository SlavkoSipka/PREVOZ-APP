# 🔄 Izmene za Netlify i Test Mode

## 📋 Rezime Izmena

Aplikacija je **potpuno prilagođena** za:
- ✅ **Netlify hosting** (umesto Vercel-a)
- ✅ **Test/Mock plaćanje** (umesto odmah pravog 2Checkout-a)

---

## 🆕 Novi Fajlovi

### 1. **netlify.toml**
Netlify konfiguracija:
- Build command
- Publish directory
- Next.js plugin
- Redirects

### 2. **components/payment/test-payment-button.tsx**
React komponenta za test plaćanje:
- Modal sa potvrdom
- Poziv test API-ja
- Success feedback
- Auto redirekcija

### 3. **app/api/test-payment/route.ts**
API endpoint za simulaciju plaćanja:
- Provera test moda
- Ažuriranje uplata na "placeno"
- Deblokiranje naloga
- Kreiranje notifikacije
- Mock transaction ID

### 4. **NETLIFY_DEPLOYMENT.md**
Kompletan vodič za deployment:
- GitHub setup
- Netlify konfiguracija
- Environment variables
- Test mode setup
- 2Checkout prebacivanje

### 5. **TEST_MODE_GUIDE.md**
Detaljan vodič za test mode:
- Objašnjenje funkcionalnosti
- Kako aktivirati/deaktivirati
- Test scenariji
- Troubleshooting
- FAQ

### 6. **QUICK_README.md**
Brzi pregled svih izmena i setup-a

---

## 🔧 Ažurirani Fajlovi

### 1. **app/uplata-obavezna/page.tsx**
Dodato:
- Test mode banner
- Conditional rendering (test vs pravo plaćanje)
- Test payment button
- Obaveštenje o test modu

### 2. **package.json**
Dodato:
- `@netlify/plugin-nextjs` dependency
- Ispravljeni lucide-react version

### 3. **.env.example** (novi layout)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Test Mode (NOVO!)
NEXT_PUBLIC_TEST_MODE=true  ← Ključna izmena

# 2Checkout (OPCIONO - zakomentarisano)
# NEXT_PUBLIC_2CHECKOUT_MERCHANT_CODE=...
# NEXT_PUBLIC_2CHECKOUT_SECRET_KEY=...
# TWOCHECKOUT_WEBHOOK_SECRET=...
```

### 4. **.gitignore**
Dodato:
```
# Netlify
.netlify
```

### 5. **README.md**
Dodati linkovi:
- TEST_MODE_GUIDE.md
- NETLIFY_DEPLOYMENT.md

### 6. **START_HERE.md**
Ažurirani next steps sa test mode i Netlify

---

## 🎯 Kako Test Mode Radi?

### Environment Varijabla

```env
NEXT_PUBLIC_TEST_MODE=true   # Test mode (mock plaćanje)
NEXT_PUBLIC_TEST_MODE=false  # Production (pravi 2Checkout)
```

### Flow u Test Modu

```
Vozač završi turu
    ↓
Nalog blokiran
    ↓
Redirect na /uplata-obavezna
    ↓
Prikaže se:
├─ 🧪 TEST MODE AKTIVAN banner (plavi)
├─ Lista neplaćenih provizija
├─ Ukupan dug
└─ "🧪 Simuliraj plaćanje (TEST MODE)" dugme
    ↓
Klik na dugme
    ↓
Modal popup:
├─ Objašnjenje šta će se desiti
├─ Lista akcija (označi plaćeno, odblokira, itd.)
└─ "✓ Potvrdi test plaćanje" dugme
    ↓
API poziv na /api/test-payment
    ↓
Server:
├─ Proveri da je TEST_MODE=true
├─ Ažuriraj uplate → status: "placeno"
├─ Dodaj mock transaction ID
├─ Odblokira vozača → blokiran: false
└─ Kreiraj notifikaciju
    ↓
Success response
    ↓
Modal prikaže: "✅ Plaćanje uspešno!"
    ↓
Redirect na /placanje-uspesno
    ↓
Vozač može ponovo koristiti platformu ✓
```

### Flow u Production Modu

```
Vozač završi turu
    ↓
Nalog blokiran
    ↓
Redirect na /uplata-obavezna
    ↓
Prikaže se:
├─ Lista neplaćenih provizija
├─ Ukupan dug
└─ "Plati odmah preko 2Checkout" dugme
    ↓
Klik vodi na 2Checkout checkout
    ↓
Vozač plati
    ↓
2Checkout webhook → /api/webhook/2checkout
    ↓
Server:
├─ Ažuriraj uplate → status: "placeno"
├─ Dodaj pravi transaction ID
├─ Odblokira vozača
└─ Kreiraj notifikaciju
    ↓
Vozač redirectovan na /placanje-uspesno
    ↓
Vozač može ponovo koristiti platformu ✓
```

---

## 🌐 Netlify Deployment

### Priprema

```bash
# 1. Git init i push
git init
git add .
git commit -m "Initial commit - TransLink"
git remote add origin https://github.com/username/translink.git
git push -u origin main
```

### Netlify Setup

1. **Import projekta:**
   - [netlify.com](https://netlify.com)
   - "New site" → "Import from GitHub"
   - Izaberi `translink` repo

2. **Build Settings** (auto-detektovano):
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Framework: Next.js

3. **Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   NEXT_PUBLIC_SITE_URL=https://translink.netlify.app
   NEXT_PUBLIC_TEST_MODE=true  ← Za početak!
   ```

4. **Deploy:**
   - Klikni "Deploy site"
   - Čekaj 3-5 minuta
   - Gotovo! 🎉

### Auto-deployment

```bash
# Svaki push automatski re-deploy-uje
git add .
git commit -m "Update"
git push

# Netlify automatski:
# 1. Detektuje push
# 2. Pokreće build
# 3. Deploy-uje novu verziju
```

---

## 🔄 Prebacivanje u Produkciju

Kada ste **100% sigurni** da sve radi:

### 1. 2Checkout Setup

```
1. Registracija: https://www.2checkout.com
2. Verifikacija (može trajati nekoliko dana)
3. Dobij credentials:
   - Merchant Code
   - API Secret Key
4. Webhook konfiguracija:
   - URL: https://translink.netlify.app/api/webhook/2checkout
   - Events: ORDER_CREATED, PAYMENT_RECEIVED
   - Secret: Sačuvaj za env vars
```

### 2. Netlify Environment Variables

Dodaj/ažuriraj:
```
NEXT_PUBLIC_TEST_MODE=false  ← ISKLJUČI test mode
NEXT_PUBLIC_2CHECKOUT_MERCHANT_CODE=vaš_code
NEXT_PUBLIC_2CHECKOUT_SECRET_KEY=vaš_key
TWOCHECKOUT_WEBHOOK_SECRET=vaš_secret
```

### 3. Redeploy

Klikni "Trigger deploy" ili push na GitHub

### 4. Testiranje

- Testiraj sa 2Checkout sandbox test karticama
- Proveri webhook callback
- Proveri da uplata radi
- Proveri deblokiranje

### 5. Go Live! 🎉

---

## 📊 Razlike: Pre vs Posle

| Aspekt | PRE (Vercel + 2Checkout) | POSLE (Netlify + Test) |
|--------|--------------------------|------------------------|
| **Hosting** | Vercel | Netlify |
| **Plaćanje** | 2Checkout odmah | Test mode prvo |
| **Testiranje** | Sandbox kartice | Mock plaćanje (instant) |
| **Troškovi** | Odmah postoje | Nema dok ne pređeš na pravo |
| **Setup** | Kompleksniji | Jednostavniji |
| **Brzina** | Nekoliko sekundi | Instant |
| **Deployment** | Git push | Git push (isto) |

---

## ✅ Prednosti Novih Izmena

### Test Mode

✅ **Bez troškova** - Ne plaćaš 2Checkout fee-ove dok testiraš  
✅ **Brzo testiranje** - Instant simulacija plaćanja  
✅ **Bez rizika** - Nema pravih transakcija  
✅ **Kompletan flow** - Sve ostalo radi normalno  
✅ **Lako prebacivanje** - Jedna env varijabla

### Netlify

✅ **Jednostavniji** - Lakši setup od Vercel-a  
✅ **GitHub integracija** - Auto-deployment  
✅ **Besplatno** - Generous free tier  
✅ **Brz** - Odličan CDN  
✅ **Next.js support** - Poseban plugin

---

## 🧪 Testiranje

### Quick Test (5 minuta)

```bash
# 1. Lokalno
npm install
npm run dev

# 2. Registracija
- Admin (kreiraj u Supabase)
- Firma → Objavi turu
- Vozač → Prihvati turu

# 3. Admin
- Odobri vozača

# 4. Vozač
- Završi turu
- Vidi "🧪 TEST MODE" banner
- Klikni "Simuliraj plaćanje"
- Potvrdi
- ✅ Success!

# 5. Verifikacija
- Nalog odblokiran
- Može ponovo prihvatati ture
```

---

## 📚 Dokumentacija

Sve je dokumentovano u:

| Fajl | Opis | Za koga |
|------|------|---------|
| [START_HERE.md](./START_HERE.md) | Početna tačka | Svi |
| [QUICKSTART.md](./QUICKSTART.md) | 5-min setup | Novi korisnici |
| [SETUP.md](./SETUP.md) | Detaljan setup | Development |
| [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) | Netlify vodič | Deployment |
| [TEST_MODE_GUIDE.md](./TEST_MODE_GUIDE.md) | Test mode | Testiranje |
| [QUICK_README.md](./QUICK_README.md) | Brzi pregled | Quick reference |

---

## 🎯 Sledeći Koraci

### Za Tebe (Odmah)

1. ✅ Pročitaj [START_HERE.md](./START_HERE.md)
2. ✅ Setup lokalno ([SETUP.md](./SETUP.md))
3. ✅ Testiraj sa Test Mode-om
4. ✅ Push na GitHub
5. ✅ Deploy na Netlify ([NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md))
6. ✅ Testiraj na production URL-u
7. ✅ Kad si zadovoljan → Dodaj 2Checkout

### Za Produkciju (Kasnije)

1. ⏳ Registruj 2Checkout nalog
2. ⏳ Čekaj verifikaciju
3. ⏳ Dobij credentials
4. ⏳ Konfiguriši webhook
5. ⏳ Isključi test mode
6. ⏳ Testiraj sa test karticama
7. ⏳ Go live! 🚀

---

## 💡 Dodatni Saveti

### Tokom Testiranja

- Koristi test mode što duže
- Testiraj sve edge case-ove
- Dokumentuj probleme
- Pravi backup baze redovno

### Pre Produkcije

- Testiraj kompletan flow 10x
- Proveri sve error scenarije
- Proveri da webhook radi
- Testiraj sa različitim korisnicima

### U Produkciji

- Prati logs (Netlify + Supabase)
- Monitoruj uplate
- Odgovaraj brzo na probleme
- Ažuriraj dokumentaciju

---

## 🆘 Pomoć

Ako nešto ne radi:

1. **Proveri dokumentaciju** - Sve je detaljno objašnjeno
2. **Supabase logs** - Za backend greške
3. **Browser console** - Za frontend greške
4. **Netlify logs** - Za deployment greške

---

**Sve je spremno! Test mode omogućava kompletno testiranje bez rizika. Deploy na Netlify je jednostavan. Uživaj! 🎉**

