# 🧪 TransLink - Test Mode Vodič

## Šta je Test Mode?

**Test Mode** je specijalna funkcionalnost koja omogućava potpuno testiranje aplikacije **bez korišćenja pravog sistema za plaćanje**. Sve funkcionalnosti rade normalno, ali plaćanje je simulirano.

---

## ✅ Prednosti Test Moda

- ✅ **Bez troškova** - Ne morate platiti 2Checkout fee-ove
- ✅ **Brzo testiranje** - Instant potvrda "plaćanja"
- ✅ **Bez rizika** - Nema pravih transakcija
- ✅ **Kompletan flow** - Sve ostalo radi isto kao u produkciji
- ✅ **Lako prebacivanje** - Jedna environment varijabla

---

## 🔧 Kako Aktivirati Test Mode?

### Lokalno (Development)

U `.env.local` fajlu:

```env
NEXT_PUBLIC_TEST_MODE=true
```

### Na Netlify (Production)

1. Idite na Netlify Dashboard
2. **Site settings** → **Environment variables**
3. Dodajte ili ažurirajte:
   ```
   NEXT_PUBLIC_TEST_MODE=true
   ```
4. **Redeploy** aplikaciju

---

## 🎯 Kako Test Mode Funkcioniše?

### 1. Normalan Tok Aplikacije

Sve funkcioniše potpuno normalno:
- ✅ Firme objavljuju ture
- ✅ Vozači prihvataju ture
- ✅ Admin odobrava vozače
- ✅ Vozači završavaju ture
- ✅ Nalog se blokira

### 2. Stranica za Plaćanje

Kada vozač završi turu i dođe do plaćanja:

**Test Mode:**
- Prikazuje se **plavi banner** "🧪 TEST MODE AKTIVAN"
- Dugme: **"🧪 Simuliraj plaćanje (TEST MODE)"**
- Objašnjenje da plaćanje neće biti naplaćeno

**Produkcija (Test Mode OFF):**
- Prikazuje se normalno plaćanje dugme
- Vodi na pravi 2Checkout checkout
- Stvarne transakcije

### 3. Simulacija Plaćanja

Kada vozač klikne "Simuliraj plaćanje":

1. **Modal popup** sa potvrdom
2. Objašnjenje šta će se desiti
3. Klik na **"✓ Potvrdi test plaćanje"**
4. Server automatski:
   - Označava uplate kao `placeno`
   - Dodaje mock transaction ID
   - Odblokira nalog vozača
   - Kreira notifikaciju
5. Redirekcija na success stranicu
6. Vozač može nastaviti normalno

---

## 📊 Razlike: Test vs Produkcija

| Feature | Test Mode | Produkcija |
|---------|-----------|------------|
| Plaćanje | Simulirano (instant) | Pravo (2Checkout) |
| Troškovi | ❌ Besplatno | ✅ Provizija + fees |
| Brzina | ⚡ Instant | ⏱️ Nekoliko sekundi |
| Webhook | ❌ Ne koristi se | ✅ Koristi se |
| Transaction ID | Mock ID | Pravi 2Checkout ID |
| Verifikacija | Automatska | Preko webhook-a |
| Testing | ✅ Perfektno | ⚠️ Pažljivo |

---

## 🧪 Testiranje Aplikacije u Test Modu

### Kompletan Test Scenario

#### 1. **Registracija Korisnika**

```
Firma:
- Registruj se kao firma
- Verifikuj email
- Login

Vozač:
- Registruj se kao vozač
- Verifikuj email
- Login

Admin:
- Kreiraj admin korisnika (videti SETUP.md)
- Login
```

#### 2. **Objavljivanje Ture**

```
Firma:
1. Dashboard → "Objavi novu turu"
2. Popuni formu:
   - Polazak: Beograd
   - Destinacija: Zagreb
   - Datum: Sutra
   - Opis: Test roba
   - Cena: 500 €
3. Objavi
4. Proveri da se tura pojavljuje u listi
```

#### 3. **Prihvatanje Ture**

```
Vozač:
1. Dashboard → Vidi novu turu
2. Klikni "Pogledaj"
3. "Prihvati turu"
4. Status: "⏳ Čeka odobrenje"
```

#### 4. **Odobravanje Vozača**

```
Admin:
1. Login
2. "Prijave vozača" tab
3. Vidi prijavu
4. "Odobri" dugme
5. Potvrdi
```

#### 5. **Završavanje Ture**

```
Vozač:
1. Login ponovo
2. Dashboard → "Moje prijave" → Status: "✅ Odobreno"
3. Vidi kontakt podatke firme
4. "Završio sam turu"
5. Potvrdi modal
```

#### 6. **TEST PLAĆANJE** 🧪

```
Vozač (automatski redirect):
1. Stranica: "Nalog je blokiran"
2. Vidi: "🧪 TEST MODE AKTIVAN" banner
3. Lista neplaćenih provizija
4. Ukupan dug: 15 €
5. Klikni: "🧪 Simuliraj plaćanje (TEST MODE)"
6. Modal:
   - Objašnjenje šta će se desiti
   - "✓ Potvrdi test plaćanje"
7. Loader (1-2 sekunde)
8. Success: "✅ Plaćanje uspešno!"
9. Redirect na success stranicu
10. Nalog odblokiran ✓
```

#### 7. **Nastavak Korišćenja**

```
Vozač:
1. Dashboard → Normalan pristup
2. Može ponovo prihvatati ture
3. Nalog više nije blokiran
```

---

## 🔄 Prebacivanje u Produkciju

Kada ste spremni za pravo plaćanje:

### 1. Dobijte 2Checkout Credentials

```
1. Registracija: https://www.2checkout.com
2. Verifikacija (može trajati nekoliko dana)
3. API Credentials:
   - Merchant Code
   - API Secret Key
4. Webhook Configuration:
   - URL: https://translink.netlify.app/api/webhook/2checkout
   - Events: ORDER_CREATED, PAYMENT_RECEIVED
   - Webhook Secret
```

### 2. Ažurirajte Environment Variables

**Lokalno (.env.local):**
```env
# Isključite test mode
NEXT_PUBLIC_TEST_MODE=false

# Dodajte 2Checkout credentials
NEXT_PUBLIC_2CHECKOUT_MERCHANT_CODE=vaš_merchant_code
NEXT_PUBLIC_2CHECKOUT_SECRET_KEY=vaš_secret_key
TWOCHECKOUT_WEBHOOK_SECRET=vaš_webhook_secret
```

**Na Netlify:**
1. Site settings → Environment variables
2. Ažurirajte iste varijable
3. **Redeploy**

### 3. Testirajte sa Test Karticama

2Checkout sandbox test kartice:
```
Uspešno plaćanje:
- Card: 4111 1111 1111 1111
- CVV: 123
- Expiry: Bilo koji datum u budućnosti

Neuspešno plaćanje:
- Card: 4000 0000 0000 0002
```

### 4. Go Live!

```
1. Prebacite 2Checkout iz Sandbox u Production mode
2. Testirajte sa pravom karticom (malu sumu)
3. Verifikujte webhook callback
4. Sve je spremno! 🎉
```

---

## 🐛 Troubleshooting Test Moda

### Problem: "Test plaćanje ne funkcioniše"

**Rešenje:**
```
1. Proverite .env.local:
   NEXT_PUBLIC_TEST_MODE=true

2. Restart dev servera:
   npm run dev

3. Proverite browser console za greške

4. Proverite da endpoint /api/test-payment radi:
   curl http://localhost:3000/api/test-payment
```

### Problem: "Banner se ne prikazuje"

**Rešenje:**
```
Environment varijabla nije učitana:
1. Restart Next.js servera
2. Hard refresh browser-a (Ctrl+Shift+R)
3. Proverite da varijabla počinje sa NEXT_PUBLIC_
```

### Problem: "Nalog nije odblokiran"

**Rešenje:**
```
1. Proverite Supabase logs
2. Proverite da service_role_key ima pristup
3. Proverite RLS politike u bazi
4. Manual check u Supabase Table Editor
```

---

## 📝 Best Practices

### Tokom Razvoja

✅ **DO:**
- Uvek koristite Test Mode
- Testirajte kompletan flow redovno
- Proverite sve edge case-ove
- Testirajte sa različitim korisnicima

❌ **DON'T:**
- Ne koristite pravi 2Checkout tokom razvoja
- Ne testirajte produkciju bez sandbox-a
- Ne deployujte bez testiranja

### Pre Produkcije

✅ **Checklist:**
- [ ] Sve radi savršeno u Test Modu
- [ ] 2Checkout nalog verifikovan
- [ ] Sandbox testiran sa test karticama
- [ ] Webhook testiran i radi
- [ ] Kompletan flow testiran u produkciji

---

## 💡 Saveti

1. **Koristite Test Mode dugo** - Ne žurite sa prebacivanjem
2. **Dokumentujte probleme** - Sve što nađete u test fazi
3. **Testirajte sve scenarije** - Uspešno, neuspešno, canceled
4. **Čuvajte backup** - Uvek pre prebacivanja u produkciju

---

## 🎓 FAQ

**Q: Koliko dugo mogu koristiti Test Mode?**  
A: Beskonačno! Nema ograničenja.

**Q: Da li Test Mode utiče na performanse?**  
A: Ne, brzina je ista kao i u produkciji.

**Q: Šta ako zaboravim da isključim Test Mode?**  
A: Aplikacija će raditi, ali plaćanja će biti simulirana (nećete primati novac).

**Q: Mogu li kombinovati Test i Production?**  
A: Ne, samo jedan mod može biti aktivan.

**Q: Da li mogu testirati webhook u Test Modu?**  
A: Ne, webhook se ne koristi u Test Modu. Webhook se testira u 2Checkout sandbox-u.

---

**Test Mode je vaš najbolji prijatelj tokom razvoja!** 🧪✨

Koristite ga maksimalno i prebacite na produkciju samo kada ste 100% sigurni.

