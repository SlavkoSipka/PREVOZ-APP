# 🔔 PUSH NOTIFICATIONS - Setup Vodič

## 📋 **ŠTA JE URAĐENO**

Implementiran je kompletan sistem za **Web Push Notifications** koji omogućava korisnicima da primaju obaveštenja direktno na telefon/desktop kao native aplikacija!

---

## 🚀 **KAKO DA POKRENEŠ**

### **1. Instaliraj Dependencies**

```bash
npm install
```

Ovo će instalirati:
- `web-push` - Library za slanje push notifikacija
- `@types/web-push` - TypeScript tipovi

### **2. Generiši VAPID Keys**

VAPID keys su potrebni za autentifikaciju push notifikacija.

```bash
npx web-push generate-vapid-keys
```

**Output će biti:**
```
Public Key:
BPxD... (dug string)

Private Key:
abc123... (dug string)
```

### **3. Dodaj VAPID Keys u Environment Variables**

#### **Lokalno (.env.local):**
```env
# VAPID Keys za Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BPxD...tvoj-public-key...
VAPID_PRIVATE_KEY=abc123...tvoj-private-key...
VAPID_EMAIL=mailto:admin@translink.com
```

#### **Na Netlify-u:**
1. Idi na **Netlify Dashboard** → **Site settings** → **Environment variables**
2. Dodaj:
   - `NEXT_PUBLIC_VAPID_PUBLIC_KEY` = tvoj public key
   - `VAPID_PRIVATE_KEY` = tvoj private key  
   - `VAPID_EMAIL` = `mailto:admin@translink.com`

⚠️ **VAŽNO:** Public key mora biti `NEXT_PUBLIC_` jer se koristi na klijentu!

### **4. Pokreni SQL Skriptu u Supabase**

1. Otvori **Supabase Dashboard**
2. Idi na **SQL Editor**
3. Otvori file: `supabase/ADD-PUSH-NOTIFICATIONS.sql`
4. Kopiraj **SVE** i klikni **Run**

Ova skripta kreira:
- ✅ `push_subscriptions` tabelu
- ✅ RLS policies
- ✅ Indekse
- ✅ Triggere

### **5. Deploy na Netlify**

```bash
git add -A
git commit -m "Add push notifications system"
git push origin main
```

Netlify će automatski deployovati sa novim environment variables!

---

## 📱 **KAKO FUNKCIONIŠE**

### **Za Korisnike:**

1. Kada korisnik uđe na sajt, vidi banner:
   > 🔔 **Omogućite obaveštenja**  
   > Primajte trenutna obaveštenja...

2. Kad klikne **"Omogući"**:
   - Browser traži dozvolu (native prompt)
   - Service Worker se registruje
   - Push subscription se kreira
   - Subscription se čuva u Supabase

3. Kad dobiju notifikaciju:
   - **Na telefonu:** Native notifikacija (zvuk, vibracija)
   - **Na desktop-u:** Browser notifikacija
   - **Offline:** Notifikacija čeka dok se ne povežu

### **Za Admina/Backend:**

Kada treba poslati notifikaciju:

```typescript
import { notifyApplicationApproved } from '@/lib/push-notifications'

// Pošalji notifikaciju
await notifyApplicationApproved(userId, {
  polazak: 'Beograd',
  destinacija: 'Novi Sad',
  turaId: '123'
})
```

---

## 🎯 **TIPOVI NOTIFIKACIJA**

Sistem automatski šalje notifikacije za:

| Event | Primalac | Notifikacija |
|-------|----------|-------------|
| 🚚 Nova tura | Vozači | "Nova tura dostupna!" |
| ✅ Odobrena prijava | Vozač | "Vaša prijava je odobrena!" |
| ❌ Odbijena prijava | Vozač | "Prijava odbijena" |
| 👤 Dodeljen vozač | Poslodavac | "Vozač dodeljen za turu!" |
| ✅ Završena tura | Poslodavac | "Tura završena! Ocenite vozača" |
| 💳 Potrebna uplata | Vozač | "Potrebno je da platite proviziju" |
| 🌟 Nova ocena | Vozač | "Dobili ste novu ocenu!" |
| 📬 Admin poruka | Svi | Prilagođena poruka |

---

## 🔧 **INTEGRACIJA SA POSTOJEĆIM KODOM**

### **Dodaj Banner na Dashboard:**

```tsx
// app/vozac/page.tsx (ili poslodavac/page.tsx)
import { EnableNotificationsBanner } from '@/components/push-notifications/enable-notifications-banner'

export default async function VozacDashboard() {
  const userData = await getUserWithProfile()
  
  return (
    <div>
      {/* Banner za omogućavanje notifikacija */}
      <EnableNotificationsBanner userId={userData.user.id} />
      
      {/* Ostatak dashboard-a */}
      {/* ... */}
    </div>
  )
}
```

### **Pošalji Notifikaciju iz Komponente:**

```tsx
'use client'
import { notifyApplicationApproved } from '@/lib/push-notifications'

const handleApprove = async (vozacId: string, tura: any) => {
  // Odobri prijavu u bazi
  await approvePrijavu(...)
  
  // Pošalji push notifikaciju
  await notifyApplicationApproved(vozacId, {
    polazak: tura.polazak,
    destinacija: tura.destinacija,
    turaId: tura.id
  })
}
```

---

## 🧪 **TESTIRANJE**

### **1. Testiraj Lokalno:**

```bash
npm run dev
```

1. Otvori stranicu
2. Klikni na **"Omogući obaveštenja"**
3. Dozvoli notifikacije u browser-u
4. Testni endpoint:

```bash
curl http://localhost:3000/api/push/send
```

### **2. Testiraj na Telefonu:**

1. Deploy na Netlify
2. Otvori sajt na telefonu (**MORA HTTPS!**)
3. Omogući notifikacije
4. Triggeruj neki event (npr. odobri prijavu)
5. Proveri da li stiže notifikacija

### **3. Debug:**

```javascript
// U browser Console-u:
navigator.serviceWorker.getRegistrations().then(console.log)
Notification.permission // "granted", "denied", ili "default"
```

---

## 📊 **BROWSER KOMPATIBILNOST**

| Browser | Desktop | Mobile |
|---------|---------|--------|
| Chrome | ✅ | ✅ |
| Firefox | ✅ | ✅ |
| Safari | ✅ (macOS 13+) | ✅ (iOS 16.4+) |
| Edge | ✅ | ✅ |

⚠️ **VAŽNO:** Push notifikacije rade SAMO preko **HTTPS**!

---

## 🔒 **BEZBEDNOST**

### **RLS Policies:**
- Korisnici mogu videti/upravaljati samo svojim subscription-ima
- Admin ne može videti tuđe subscription-e (privatnost)

### **VAPID Keys:**
- Private key je **server-only** (ne sme biti exposed)
- Public key je safe za klijent
- Keys se NE commituju u Git (dodaj u `.env.local`)

---

## 🐛 **TROUBLESHOOTING**

### **"Notifikacije ne stižu"**
1. Proveri da li je sajt na HTTPS
2. Proveri VAPID keys u env variables
3. Proveri da li korisnik ima `push_subscriptions` u bazi
4. Pogledaj Console errors u F12

### **"Service Worker se ne registruje"**
1. Proveri da li postoji `/public/sw.js`
2. Hard refresh (Ctrl+Shift+R)
3. Obriši cache u DevTools

### **"Push subscription fails"**
1. Proveri `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
2. Proveri da li je format validan (Base64 URL safe)

---

## 📚 **FAJLOVI KREIRANI**

```
📁 PROJEKAT/
├── 📄 public/sw.js                                    # Service Worker
├── 📄 hooks/use-push-notifications.ts                 # React Hook
├── 📄 components/push-notifications/
│   └── enable-notifications-banner.tsx                # UI Banner
├── 📄 app/api/push/send/route.ts                      # Server API
├── 📄 lib/push-notifications.ts                       # Helper Functions
├── 📄 supabase/ADD-PUSH-NOTIFICATIONS.sql             # Database Schema
└── 📄 PUSH-NOTIFICATIONS-SETUP.md                     # Ovaj file
```

---

## ✅ **CHECKLIST**

- [ ] Instaliran `web-push` paket
- [ ] Generisani VAPID keys
- [ ] VAPID keys dodati u `.env.local`
- [ ] VAPID keys dodati na Netlify
- [ ] SQL skripta pokrenuta u Supabase
- [ ] Service Worker (`/public/sw.js`) kreiran
- [ ] Banner dodat na dashboard stranice
- [ ] Testirano lokalno
- [ ] Deploy na Netlify
- [ ] Testirano na telefonu

---

**🎉 GOTOVO! Push notifikacije su aktivne!** 🔔

Korisnici će sada dobijati obaveštenja direktno na telefon!

