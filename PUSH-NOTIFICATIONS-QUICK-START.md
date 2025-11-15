# 🔔 PUSH NOTIFICATIONS - Quick Start

## ⚡ **5 Minuta Setup**

### **1. Generiši VAPID Keys**
```bash
npx web-push generate-vapid-keys
```

### **2. Dodaj u Environment**

#### **Lokalno - `.env.local`:**
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BPx...your-public-key...
VAPID_PRIVATE_KEY=abc...your-private-key...
VAPID_EMAIL=mailto:admin@translink.com
```

#### **Netlify:**
Netlify Dashboard → Site settings → Environment variables → Add:
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_EMAIL`

### **3. SQL Skripta u Supabase**
```sql
-- Otvori: supabase/ADD-PUSH-NOTIFICATIONS.sql
-- Kopiraj SVE → Paste u Supabase SQL Editor → RUN
```

### **4. Instaliraj Dependencies**
```bash
npm install
```

### **5. Deploy**
```bash
git add -A
git commit -m "Add push notifications"
git push origin main
```

---

## ✅ **Testiranje**

1. **Otvori sajt** (mora HTTPS!)
2. **Login** kao vozač/poslodavac
3. Vidi banner: **"Omogućite obaveštenja"**
4. Klikni **"Omogući"**
5. Dozvoli u browseru
6. **Test:** Odobri neku prijavu → Proveri da li notifikacija stiže!

---

## 📱 **Kako Poslati Notifikaciju**

```typescript
import { notifyApplicationApproved } from '@/lib/push-notifications'

await notifyApplicationApproved(vozacId, {
  polazak: 'Beograd',
  destinacija: 'Novi Sad',
  turaId: '123'
})
```

---

## 🎯 **Ready-Made Functions**

```typescript
notifyNewTour()              // Nova tura
notifyApplicationApproved()  // Prijava odobrena
notifyApplicationRejected()  // Prijava odbijena
notifyDriverAssigned()       // Vozač dodeljen
notifyTourFinished()         // Tura završena
notifyPaymentRequired()      // Potrebna uplata
notifyNewRating()            // Nova ocena
notifyAdminMessage()         // Admin poruka
```

---

## 🐛 **Troubleshooting**

| Problem | Rešenje |
|---------|---------|
| Notifikacije ne stižu | Proveri da je sajt na **HTTPS** |
| Service Worker error | Hard refresh: **Ctrl+Shift+R** |
| Permission denied | Dozvoli notifikacije u browser settings |
| VAPID error | Proveri da je `NEXT_PUBLIC_` prefix na public key |

---

## 📚 **Full Documentation**

Detaljni vodič: `PUSH-NOTIFICATIONS-SETUP.md`

