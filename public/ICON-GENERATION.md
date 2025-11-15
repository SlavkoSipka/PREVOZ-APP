# 🎨 PWA Icons Generation Guide

## 📱 **Potrebne Ikone**

Za PWA i Push Notifications, potrebne su sledeće ikone:

```
public/
├── icon-72x72.png       (Badge icon)
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png     (Main PWA icon)
├── icon-384x384.png
└── icon-512x512.png     (High-res PWA icon)
```

## 🚀 **Brzi Način - Automatska Generacija**

### **Opcija 1: PWA Asset Generator (Preporučeno)**

1. Idi na: https://www.pwabuilder.com/imageGenerator
2. Upload svoj logo (preporučeno: 512x512px PNG sa transparentom)
3. Download generisane ikone
4. Kopiraj sve u `public/` folder

### **Opcija 2: Real Favicon Generator**

1. Idi na: https://realfavicongenerator.net/
2. Upload svoj logo
3. Selektuj "Progressive Web App" opciju
4. Download generisane ikone
5. Kopiraj sve u `public/` folder

---

## 🎨 **Dizajn Preporuke**

### **Za TransLink Logo:**

```
- Boja: Zelena (#16a34a) - TransLink brand
- Stil: Minimalist, flat design
- Icon: Truck/Transport simbol
- Background: Možda solid color ili transparent
```

### **Dimenzije:**

- **72x72** - Android notification badge
- **192x192** - Android home screen, notification icon
- **512x512** - High-resolution, splash screens

---

## 🛠️ **DIY - Napravi Sam (Photoshop/Figma/Canva)**

### **Koraci:**

1. Kreiraj canvas dimenzija **512x512px**
2. Dizajniraj logo (centrirano, padding ~10%)
3. Export kao PNG sa transparentom
4. Resize za sve dimenzije (72, 96, 128, 144, 152, 192, 384, 512)
5. Snimi u `public/` folder sa formatom: `icon-{size}x{size}.png`

### **Online Tools za Resize:**

- **Birme** - https://www.birme.net/
- **Bulk Resize Photos** - https://bulkresizephotos.com/

---

## ✅ **Provera**

Nakon dodavanja ikona:

1. Restartuj dev server: `npm run dev`
2. Otvori sajt
3. F12 → Application → Manifest
4. Proveri da li su sve ikone ucitane

---

## 📝 **Placeholder za Sada**

Ako nemaš još logo, možeš koristiti privremene ikone:

### **Generate via Favicon.io:**

```bash
1. Idi na: https://favicon.io/favicon-generator/
2. Text: "TL" (TransLink inicijali)
3. Background: #16a34a (zelena)
4. Font: Bold
5. Download & extract
6. Rename files po formatu iznad
```

---

## 🎯 **Kada Budeš Imao Finalni Logo:**

Samo zameni sve `.png` fajlove u `public/` i deploy!

PWA manifest (`public/manifest.json`) automatski pokazuje na nove ikone.

