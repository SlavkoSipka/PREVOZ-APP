# 🔧 Cache-Busting Fix - Rešenje za Infinite Loop Nakon Deploy-a (21.11.2024)

## 🔴 **PROBLEM:**

Nakon `git push` i Netlify deploy-a, sajt na telefonu ulazi u **infinite redirect loop** na `/prijava` stranici.

### **Uzrok:**
1. **Browser cache** - telefon kešira stari JavaScript bundle
2. **Build ID mismatch** - novi deploy generiše novi build ID
3. **Stari JS fajlovi ne postoje** - Next.js ih briše sa servera
4. **404 na bundle** - browser traži stari JS fajl → dobija 404
5. **Session corruption** - stanje aplikacije se pokvari
6. **Redirect loop** - korisnik ne može da se uloguje

---

## ✅ **REŠENJE:**

### **1. Version Checker Komponenta** 🆕
📂 `components/version-checker.tsx`

**Šta radi:**
- ✅ Detektuje kada je nova verzija deploy-ovana
- ✅ Automatski čisti browser cache
- ✅ Hard reload aplikacije
- ✅ Proverava za nove verzije svakih 5 minuta
- ✅ Pametno odlučuje kada da reload-uje (ne prekida korisnika)

**Kako:**
```tsx
// Čuva build ID u localStorage
const BUILD_VERSION = process.env.NEXT_PUBLIC_BUILD_ID || Date.now()
localStorage.setItem('app_version', BUILD_VERSION)

// Proverava da li je promenjen
if (STORED_VERSION !== BUILD_VERSION) {
  // Čisti cache i reload-uje
  caches.keys().then(names => names.forEach(caches.delete))
  window.location.reload()
}
```

---

### **2. Next.js Config - Unique Build ID**
📂 `next.config.js`

**Dodato:**
```js
generateBuildId: async () => {
  return `build-${Date.now()}`
}
```

**Šta radi:**
- Svaki deploy dobija **unique build ID**
- Version checker može detektovati promene
- Eliminise cache konflikte

---

### **3. Cache Headers - No Cache za HTML**
📂 `next.config.js` + `middleware.ts`

**Dodato u config:**
```js
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
      ],
    },
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ]
}
```

**Dodato u middleware:**
```ts
if (!request.nextUrl.pathname.startsWith('/_next/static')) {
  response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
}
```

**Šta radi:**
- ✅ HTML stranice se **ne kešeraju**
- ✅ Static fajlovi (JS, CSS, slike) se kešeraju dugoročno
- ✅ Browser uvek učitava najnoviji HTML
- ✅ Eliminisan conflict između stare i nove verzije

---

### **4. Integracija u Layout**
📂 `app/layout.tsx`

**Dodato:**
```tsx
import { VersionChecker } from '@/components/version-checker'

<body>
  <VersionChecker /> {/* 👈 Dodato */}
  <ClearCacheOnMount />
  <MobileConsole />
  {children}
  <Toaster />
</body>
```

---

## 🎯 **KAKO RADI:**

### **Pre Deploy-a:**
1. Korisnik je na sajtu - sve radi normalno
2. `app_version = build-1732208400000`

### **Deploy Nova Verzija:**
1. Netlify build-uje novu verziju
2. Novi build ID: `build-1732212000000`
3. Stari JS bundlovi se brišu sa servera

### **Posle Deploy-a:**
1. **Korisnik refreshuje sajt**
2. `VersionChecker` se pokreće
3. Detektuje: `app_version !== current_build_id`
4. **Automatski:**
   - Čisti sve cache-ove (`caches.delete()`)
   - Hard reload (`window.location.reload()`)
   - Sačuva novu verziju
5. ✅ **Sajt radi normalno!**

### **Ako korisnik NE refreshuje:**
1. Version checker proverava svakih **5 minuta**
2. Pokušava da fetch-uje `/_next/static/chunks/main-app.js`
3. Ako dobije **404** → novi deploy!
4. Ako je na `/prijava` ili `/` → **odmah reload**
5. Ako radi nešto važno → čeka **3 sekunde** pa reload

---

## 📱 **TESTIRANJE:**

### **Scenario 1: Login Loop (pre fix-a)**
1. Korisnik je ulogovan na telefonu
2. Deploy nova verzija
3. Korisnik pokušava da se uloguje
4. ❌ **Infinite redirect loop**

### **Scenario 2: Login Loop (posle fix-a)**
1. Korisnik je ulogovan na telefonu
2. Deploy nova verzija
3. Korisnik pokušava da se uloguje
4. `VersionChecker` detektuje novu verziju
5. **Automatski hard reload**
6. ✅ **Login radi normalno!**

---

## 🚀 **DEPLOYMENT:**

```bash
git add .
git commit -m "Fix: Add version checker to prevent infinite loop after deploy"
git push
```

---

## 💡 **BONUS FEATURES:**

### **1. Pametan Reload**
- Ne prekida korisnika tokom važnih akcija
- Reload-uje samo na sigurnim stranicama (`/prijava`, `/`)
- Čeka 3 sekunde ako je korisnik aktivan

### **2. Background Check**
- Proverava za nove verzije **automatski** (svakih 5 min)
- Korisnik ne mora ručno da refreshuje

### **3. Cache-First za Static**
- Static fajlovi (JS, CSS, slike) se i dalje kešeraju
- Samo HTML stranice se ne kešeraju
- Optimizovano za **brzinu + freshness**

---

## 🔍 **DEBUG INFO:**

### **Ako problem i dalje postoji:**

1. **Otvori Chrome DevTools → Console**
2. Proveri da li vidiš:
   ```
   🔄 Nova verzija detektovana! Čišćenje cache-a...
   ```

3. **Proveri localStorage:**
   ```js
   localStorage.getItem('app_version')
   // Trebalo bi: "build-1732212000000"
   ```

4. **Ručno očisti sve:**
   ```js
   localStorage.clear()
   caches.keys().then(names => names.forEach(name => caches.delete(name)))
   location.reload()
   ```

---

## ✅ **FINALNI REZULTAT:**

- ✅ **Nema više infinite loop-a** nakon deploy-a
- ✅ **Automatski cache-busting** kada je nova verzija
- ✅ **Pametan reload** - ne prekida korisnika
- ✅ **Background monitoring** - automatska detekcija
- ✅ **Optimizovano** - static fajlovi i dalje kešerani

---

**Problem rešen! 🎉**

