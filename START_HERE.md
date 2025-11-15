# 🚀 TransLink - Počnite Ovde!

Dobrodošli u **TransLink** - platformu za povezivanje firmi i vozača kamiona.

---

## 📚 Šta Prvo Čitati?

### 1. **Nova instalacija?**
👉 Čitajte: [QUICKSTART.md](./QUICKSTART.md) (5 minuta)

### 2. **Detaljan setup?**
👉 Čitajte: [SETUP.md](./SETUP.md) (15-30 minuta)

### 3. **Deployment na Netlify?**
👉 Čitajte: [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)

### 4. **Lista funkcionalnosti?**
👉 Čitajte: [FEATURES.md](./FEATURES.md)

### 5. **Pregled projekta?**
👉 Čitajte: [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)

---

## ⚡ Najbrži Start (Copy-Paste)

```bash
# 1. Instalacija
npm install

# 2. Kreirajte .env.local (kopirajte iz .env.example)
cp .env.example .env.local

# 3. Ažurirajte .env.local sa vašim credentials

# 4. Pokrenite
npm run dev
```

**Važno:** Pre pokretanja morate:
1. Kreirati Supabase projekat
2. Izvršiti `supabase/schema.sql`
3. Dodati credentials u `.env.local`

Sve je objašnjeno u [SETUP.md](./SETUP.md)

---

## 🎯 Šta je TransLink?

**TransLink** povezuje:
- 🏢 **Firme** koje imaju robu za prevoz
- 🚛 **Vozače** koji žele da voze te ture
- 👨‍💼 **Admine** koji kontrolišu kvalitet

### Kako Funkcioniše?

1. Firma objavljuje turu (polazak, destinacija, cena)
2. Vozači se prijavljuju
3. Admin odobrava jednog vozača
4. Vozač izvršava transport
5. Nakon ture, vozač plaća proviziju (15€)
6. Sistem automatski odblokira nalog nakon plaćanja

---

## 🛠️ Tehnologije

- **Frontend:** Next.js 14, TypeScript, TailwindCSS
- **Backend:** Supabase (Auth, Database, Storage)
- **Plaćanje:** 2Checkout
- **UI:** shadcn/ui komponente
- **Hosting:** Vercel

---

## 📂 Struktura Projekta

```
translink/
├── app/              # Sve stranice (Next.js App Router)
│   ├── admin/       # Admin dashboard
│   ├── firma/       # Firma dashboard
│   ├── vozac/       # Vozač dashboard
│   └── api/         # API routes (webhook)
│
├── components/       # React komponente
│   ├── ui/          # UI komponente (shadcn)
│   └── ...          # Specifične komponente
│
├── lib/             # Utility funkcije
│   └── supabase/    # Supabase klijenti
│
├── supabase/        # SQL schema
│   └── schema.sql   # ⚠️ Važno za bazu!
│
└── Documentation/
    ├── README.md              # Osnovne info
    ├── QUICKSTART.md          # 5-min setup
    ├── SETUP.md               # Detaljan setup
    ├── DEPLOYMENT.md          # Production
    ├── FEATURES.md            # Lista funkcionalnosti
    ├── PROJECT_SUMMARY.md     # Pregled projekta
    └── START_HERE.md          # Ovaj fajl
```

---

## ✅ Pre Nego Što Počnete

### Potrebni Nalozi

1. ✅ **Supabase** nalog (besplatan)
   - [supabase.com](https://supabase.com)
   - Kreirati projekat
   - Izvršiti SQL schema

2. ✅ **2Checkout** nalog (za plaćanja)
   - [2checkout.com](https://www.2checkout.com)
   - Verifikacija može trajati nekoliko dana
   - Za testiranje možete privremeno koristiti mock podatke

### Instalirani Alati

- ✅ Node.js 18+ ([nodejs.org](https://nodejs.org))
- ✅ npm ili pnpm
- ✅ Git (opciono)

---

## 🎓 Kako Koristiti Projekat?

### Development

```bash
npm run dev      # Pokreće dev server (localhost:3000)
npm run build    # Build za produkciju
npm run start    # Pokreće production build
npm run lint     # Provera linter grešaka
```

### Testiranje

1. **Kreirajte Admin korisnika** (vidite SETUP.md)
2. **Registrujte se kao firma** i objavite turu
3. **Registrujte se kao vozač** i prihvatite turu
4. **Prijavite se kao admin** i odobrite vozača
5. **Završite turu kao vozač** i testirajte plaćanje

---

## 🆘 Problemi?

### Česte Greške

**"Cannot find Supabase URL"**
- Proverite `.env.local` fajl
- Proverite nazive varijabli

**"RLS policy violation"**
- Izvršite kompletan `supabase/schema.sql`
- Proverite da su sve tabele kreirane

**"Webhook not working"**
- Webhook-ovi ne rade na localhost
- Koristite ngrok ili deploy na Vercel

### Gde Tražiti Pomoć?

1. Proverite odgovarajuću dokumentaciju
2. Supabase Logs (za backend greške)
3. Browser Console (za frontend greške)
4. Vercel Logs (za production greške)

---

## 📞 Kontakt i Dokumentacija

### Dokumenti (Sve je u projektu!)

| Fajl | Opis |
|------|------|
| [README.md](./README.md) | Osnovne informacije |
| [QUICKSTART.md](./QUICKSTART.md) | Brzi start (5 min) |
| [SETUP.md](./SETUP.md) | Detaljan setup |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment |
| [FEATURES.md](./FEATURES.md) | Sve funkcionalnosti |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | Pregled projekta |

### Inline Dokumentacija

- SQL komentari u `supabase/schema.sql`
- TypeScript komentari u svim fajlovima
- README sekcije u svakom folderu

---

## 🚀 Next Steps

1. ✅ Pročitajte [QUICKSTART.md](./QUICKSTART.md)
2. ✅ Pratite uputstva u [SETUP.md](./SETUP.md)
3. ✅ Testirajte aplikaciju lokalno sa **Test Mode** (bez pravog plaćanja)
4. ✅ Push na GitHub i deploy na Netlify sa [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)
5. ✅ Testirajte kompletan flow sa mock plaćanjem
6. ✅ Kada ste spremni: Konfigurirajte 2Checkout i isključite Test Mode

---

## ⭐ Status Projekta

**✅ PRODUCTION READY**

- Sve funkcionalnosti implementirane
- Kompletna dokumentacija
- Sigurnost konfigurisana
- Spremno za deployment

---

**Powered by:** Next.js 14 + Supabase + TypeScript  
**UI:** TailwindCSS + shadcn/ui  
**Version:** 1.0.0

Srećan rad! 🚚✨

