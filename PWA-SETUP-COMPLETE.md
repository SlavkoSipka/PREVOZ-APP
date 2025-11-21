# 📱 PWA Setup - KOMPLETNO (21.11.2024)

## ✅ **GOTOVO!**

Sajt je sada **PWA (Progressive Web App)** - korisnici mogu dodati ikonu na home screen! 🎉

---

## 🎨 **DODATI FAJLOVI:**

### **Ikonice u `public/` folder:**
1. ✅ `android-chrome-512x512.png` - za Android home screen
2. ✅ `apple-touch-icon.png` - za iOS home screen
3. ✅ `favicon.ico` - za browser tab
4. ✅ `favicon-32x32.png` - za browser tab (visoka rezolucija)

---

## ⚙️ **IZMENJENI FAJLOVI:**

### **1. `public/manifest.json`**
**PRE:**
```json
"icons": [
  {
    "src": "data:image/svg+xml,<svg...>", // inline SVG
    ...
  }
]
```

**POSLE:**
```json
"icons": [
  {
    "src": "/android-chrome-512x512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "/favicon-32x32.png",
    "sizes": "32x32",
    "type": "image/png"
  }
]
```

---

### **2. `app/layout.tsx`**
**Dodato:**
```tsx
export const metadata: Metadata = {
  // ...
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  // ...
}
```

---

## 📱 **KAKO FUNKCIONIŠE:**

### **Android (Chrome):**
1. Korisnik otvori `prevezime.rs` na telefonu
2. Chrome automatski prikaže banner: **"Dodaj TransLink na početni ekran"**
3. Ili: Chrome meni (tri tačkice) → **"Add to Home Screen"**
4. Korisnik klikne **"Add"**
5. ✅ Ikona se pojavi na home screen-u!
6. Kada klikne ikonu → otvara se sajt u **fullscreen** režimu (bez URL bara)

### **iOS (Safari):**
1. Korisnik otvori `prevezime.rs` u Safari-u
2. Klikne **Share** dugme (kvadrat sa strelicom)
3. Klikne **"Add to Home Screen"**
4. ✅ Ikona se pojavi na home screen-u!

---

## 🔍 **KAKO TESTIRATI:**

### **Desktop Chrome:**
1. Otvori DevTools (F12)
2. Idi na **Application** tab
3. U levom meniju klikni **Manifest**
4. Proveri da li se prikazuju ikonice i podaci

### **Android Chrome:**
1. Otvori `prevezime.rs` na telefonu
2. Chrome Menu (⋮) → **"Add to Home Screen"**
3. Klikni **"Add"**
4. Ikona se pojavi na home screen-u
5. Otvori aplikaciju → treba da bude fullscreen (bez URL bara)

### **iOS Safari:**
1. Otvori `prevezime.rs` u Safari-u
2. Share → **"Add to Home Screen"**
3. Ikona se pojavi na home screen-u
4. Otvori aplikaciju

---

## ✅ **ŠTA RADI:**

### **Kada korisnik otvori aplikaciju sa home screen-a:**
- ✅ Otvara se u **fullscreen** režimu (izgleda kao native app)
- ✅ Nema browser URL bara
- ✅ Nema "Nazad" dugmeta iz browser-a
- ✅ **Uvek učitava live sa interneta** (bez offline cache-a)
- ✅ Svaki put najnovija verzija sajta

---

## ❌ **ŠTA NE RADI (namerno):**

- ❌ **Offline rad** - nema cache-ovanja (korisnik mora imati internet)
- ❌ **Push notifikacije** - uklonjene (koristiš SMS umesto toga)
- ❌ **Service Worker** - nije potreban za samo home screen ikonu

---

## 🎯 **MANIFEST.JSON - Podešavanja:**

```json
{
  "name": "TransLink - Platforma za Transport",  // Pun naziv
  "short_name": "TransLink",                     // Skraćen naziv (ispod ikone)
  "description": "Platforma koja povezuje poslodavce i vozače za efikasan transport robe",
  "start_url": "/",                              // Početna stranica
  "display": "standalone",                        // Fullscreen režim (bez URL bara)
  "background_color": "#ffffff",                  // Pozadina splash screen-a
  "theme_color": "#16a34a",                       // Boja status bara (zelena)
  "orientation": "any",                           // Dozvoljava portrait i landscape
  "scope": "/",                                   // Opseg aplikacije
  "icons": [ ... ]                                // Ikonice
}
```

---

## 📋 **DEPLOYMENT CHECKLIST:**

- [x] Ikonice dodane u `public/`
- [x] `manifest.json` ažuriran
- [x] `app/layout.tsx` ažuriran
- [ ] **Deploy na Netlify** (`prevezime.rs`)
- [ ] Testiraj na Android Chrome
- [ ] Testiraj na iOS Safari

---

## 🚀 **SLEDEĆI KORAK:**

### **Deploy na production:**
```bash
git add .
git commit -m "Add PWA icons and manifest for home screen installation"
git push
```

**Netlify će automatski deploy-ovati novu verziju!**

---

## 📱 **PROVERA NA MOBILNOM:**

### **Android:**
1. Otvori Chrome
2. Idi na `https://prevezime.rs`
3. Chrome Menu → "Add to Home Screen"

### **iOS:**
1. Otvori Safari
2. Idi na `https://prevezime.rs`
3. Share → "Add to Home Screen"

---

## 💡 **NAPOMENA:**

- PWA **MORA** biti na **HTTPS** (localhost ili production)
- Na `http://` NE RADI (osim localhost-a)
- Chrome automatski detektuje PWA ako ima `manifest.json` + HTTPS
- Nema potrebe za Service Worker-om ako ne želiš offline rad

---

✅ **GOTOVO! Sajt je sada instalabilan kao aplikacija!** 🎉📱

Samo deploy-uj i testiraj na telefonu!

