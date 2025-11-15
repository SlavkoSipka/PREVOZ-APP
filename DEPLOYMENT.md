# TransLink - Deployment Guide

## 🚀 Deployment na Vercel

### Priprema

1. **Push kod na GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - TransLink aplikacija"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Kreiranje Vercel projekta**
   - Idite na [vercel.com](https://vercel.com)
   - Kliknite "New Project"
   - Importujte GitHub repository
   - Framework: **Next.js** (automatski detektovan)

### Environment Variables

U Vercel dashboard-u, dodajte sledeće environment varijable:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vašprojekt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=vaš_anon_key
SUPABASE_SERVICE_ROLE_KEY=vaš_service_role_key

NEXT_PUBLIC_2CHECKOUT_MERCHANT_CODE=vaš_merchant_code
NEXT_PUBLIC_2CHECKOUT_SECRET_KEY=vaš_secret_key
TWOCHECKOUT_WEBHOOK_SECRET=vaš_webhook_secret

NEXT_PUBLIC_SITE_URL=https://translink.vercel.app
```

**Napomena:** Zamenite `NEXT_PUBLIC_SITE_URL` sa vašim production URL-om nakon deployment-a.

### Deploy

1. Kliknite **Deploy**
2. Sačekajte da se build završi (2-3 minuta)
3. Proverite deployment na generated URL-u

---

## 🔧 Post-Deployment konfiguracija

### 1. Ažuriranje 2Checkout Webhook-a

1. Idite na 2Checkout dashboard
2. Navigirajte na **Integrations** → **Webhooks**
3. Ažurirajte webhook URL na:
   ```
   https://vasa-domena.vercel.app/api/webhook/2checkout
   ```
4. Testirajte webhook

### 2. Supabase konfiguracija

U Supabase dashboard-u:

1. **Auth URL Configuration:**
   - Idite na **Authentication** → **URL Configuration**
   - Dodajte u **Redirect URLs**:
     ```
     https://vasa-domena.vercel.app/prijava
     https://vasa-domena.vercel.app/
     ```

2. **Site URL:**
   ```
   https://vasa-domena.vercel.app
   ```

### 3. Custom Domen (opciono)

1. U Vercel dashboard → **Settings** → **Domains**
2. Dodajte custom domen (npr. `translink.rs`)
3. Ažurirajte DNS zapise kod domen registrara
4. Ažurirajte `NEXT_PUBLIC_SITE_URL` environment varijablu

---

## 📊 Monitoring i Logging

### Vercel Analytics

```bash
npm install @vercel/analytics
```

U `app/layout.tsx`:
```tsx
import { Analytics } from '@vercel/analytics/react'

// Dodajte u body
<Analytics />
```

### Error Tracking

Preporučujemo integraciju sa:
- **Sentry** - za error tracking
- **LogRocket** - za session replay
- **Vercel Analytics** - za performance

---

## 🔐 Sigurnost

### 1. Environment Variables

- ✅ Nikada ne commitujte `.env.local`
- ✅ Koristite Vercel Environment Variables
- ✅ Rótirajte ključeve periodično

### 2. Supabase RLS

Proverite da su sve RLS politike aktivne:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### 3. Rate Limiting

Dodajte rate limiting za API rute (opciono):

```bash
npm install @upstash/ratelimit
```

---

## 🧪 Testiranje Production Build-a

Pre deployment-a, testirajte lokalno:

```bash
# Build
npm run build

# Start production server
npm run start
```

Proverite:
- ✅ Sve stranice se učitavaju
- ✅ Auth radi ispravno
- ✅ Database queries rade
- ✅ Nema console errors

---

## 📈 Performance Optimization

### 1. Image Optimization

Next.js automatski optimizuje slike. Koristite `<Image>` komponentu:

```tsx
import Image from 'next/image'

<Image 
  src="/logo.png" 
  alt="Logo" 
  width={200} 
  height={200}
  priority 
/>
```

### 2. Font Optimization

U `app/layout.tsx` već koristimo Next.js font optimization sa Inter fontom.

### 3. Bundle Size

Proverite bundle size:
```bash
npm run build
# Pogledajte output za veličinu bundle-a
```

---

## 🔄 CI/CD Workflow

Vercel automatski deployuje svaki push na `main` branch.

### Branch Strategy

- `main` - Production
- `dev` - Development (kreirajte Vercel preview)
- `feature/*` - Feature branches

### Auto-deployment

Vercel će automatski:
1. Build-ovati projekat
2. Pokrenuti linter
3. Generisati preview URL za PR-ove
4. Deploy-ovati na production kada se merge-uje u `main`

---

## 📞 Troubleshooting

### Build Failed

1. Proverite logs u Vercel dashboard
2. Pokrenite `npm run build` lokalno
3. Proverite da su sve dependencies instalirane

### Environment Variables ne rade

1. Proverite nazive varijabli (case-sensitive)
2. Restart deployment nakon izmene
3. Proverite da su dostupne u build i runtime

### 500 Server Error

1. Proverite Vercel Function logs
2. Proverite Supabase RLS politike
3. Proverite da service role key radi

---

## ✅ Pre-launch Checklist

- [ ] Sve environment variables postavljene
- [ ] Custom domen konfigurisan (ako je potreban)
- [ ] 2Checkout webhook ažuriran
- [ ] Supabase redirect URLs ažurirane
- [ ] SSL sertifikat aktivan (automatski na Vercel)
- [ ] Test registracija i login
- [ ] Test kreiranje ture
- [ ] Test prihvatanje ture
- [ ] Test admin odobravanje
- [ ] Test plaćanje (sandbox mode)
- [ ] Error monitoring setup
- [ ] Analytics setup
- [ ] Backup strategy za bazu

---

Vaša aplikacija je spremna za produkciju! 🎉

