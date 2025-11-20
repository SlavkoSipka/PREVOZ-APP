# 🌐 Domain Update Checklist - prevezime.rs

## ✅ Urađeno u Kodu

### 1. **Push Notifications - Dinamički Domain**
Umesto hardcoded `test.aislike.rs`, sada koristi dinamički hostname:

**Izmenjeni fajlovi:**
- ✅ `components/push-notifications/enable-notifications-banner.tsx`
- ✅ `hooks/use-push-notifications.ts` (2 mesta)
- ✅ `lib/notification-helpers.ts`

**Rezultat**: Aplikacija će automatski koristiti trenutni domain (prevezime.rs) u svim porukama i instrukcijama.

---

## 🔧 Što MORAŠ da uradiš (Netlify/Supabase/Google)

### 1. **Netlify Environment Variables** ✅ (Već urađeno)
```
NEXT_PUBLIC_SITE_URL = https://prevezime.rs
```

### 2. **Netlify Redeploy** 🔴 OBAVEZNO!
⚠️ **Environment variables se primenjuju tek nakon redeploy-a!**

**Kako:**
1. Idi na **Netlify Dashboard**
2. Otvori svoj site
3. Idi na **Deploys** tab
4. Klikni **Trigger deploy** → **Deploy site**
5. Sačekaj 2-3 minuta da build završi

---

### 3. **Supabase Dashboard - URL Configuration**
Idi na: **Authentication** → **URL Configuration**

```
✅ Site URL: https://prevezime.rs

✅ Redirect URLs:
   https://prevezime.rs/**
   https://prevezime.rs/auth/callback
   https://prevoz.netlify.app/** (opciono - backup)
```

**Screenshot lokacija**: Authentication → URL Configuration

---

### 4. **Google Cloud Console - OAuth Credentials**
Idi na: **APIs & Services** → **Credentials** → **OAuth 2.0 Client IDs**

```
✅ Authorized JavaScript origins:
   https://prevezime.rs
   https://[supabase-project-id].supabase.co

✅ Authorized redirect URIs:
   https://prevezime.rs/auth/callback
   https://[supabase-project-id].supabase.co/auth/v1/callback
```

**Gde naći Supabase Project ID:**
- Supabase Dashboard → Project Settings → General → Project ID

---

### 5. **Custom Domain na Netlify** (ako već nisi)
1. Idi na **Domain management**
2. Dodaj custom domain: `prevezime.rs`
3. Podesi DNS zapise kod svog domain provajdera:

```
CNAME @ prevezime.rs → [your-site].netlify.app
```

Ili:
```
A @ prevezime.rs → 75.2.60.5
```

4. Omogući HTTPS (automatski nakon DNS propagacije)

---

## 🎯 Kako Proveriti da li Radi?

### Test 1: Environment Variable
1. Nakon redeploy-a, otvori **browser console** na `https://prevezime.rs`
2. U konzoli ukucaj:
```javascript
console.log(window.location.origin)
```
3. Trebalo bi da bude: `https://prevezime.rs`

### Test 2: Google OAuth
1. Idi na `https://prevezime.rs/prijava`
2. Klikni "Prijavi se preko Google-a"
3. Izaberi Google nalog
4. Trebalo bi da radi bez greške!

### Test 3: Push Notifications
1. Idi na `/vozac/profil` ili `/poslodavac/profil`
2. Omogući push notifications
3. Proveri da sve poruke prikazuju `prevezime.rs` umesto `test.aislike.rs`

---

## 📝 Šta Kod Automatski Radi?

### `NEXT_PUBLIC_SITE_URL` koristi se u:
1. **OAuth redirect** (`lib/auth-helpers.client.ts`)
   ```typescript
   const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
   ```

2. **Push notification API** (`lib/notification-helpers.ts`)
   ```typescript
   const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
   ```

3. **Payment redirect** (`app/uplata-obavezna/page.tsx`)
   ```typescript
   return-url=${process.env.NEXT_PUBLIC_SITE_URL}/placanje-uspesno
   ```

### Dinamički Domain koristi se u:
- Push notification instrukcije (automatski prikazuje trenutni hostname)
- Error poruke (prikazuje trenutni domain)

---

## ⚠️ Česte Greške

### Greška 1: "Session je istekla" pri Google login-u
**Uzrok**: Netlify nije redeploy-ovan nakon dodavanja env variable.
**Rešenje**: Trigger deploy na Netlify-u.

### Greška 2: "Invalid redirect_uri" pri Google login-u
**Uzrok**: Google OAuth nema `https://prevezime.rs/auth/callback`.
**Rešenje**: Dodaj u Google Cloud Console → Authorized redirect URIs.

### Greška 3: Push notifications prikazuju pogrešan domain
**Uzrok**: Browser cache.
**Rešenje**: Hard refresh (Ctrl+Shift+R) ili očisti cache.

---

## ✅ Finalna Checklista

Pre nego što ideš LIVE:

- [ ] Dodao `NEXT_PUBLIC_SITE_URL=https://prevezime.rs` u Netlify env vars
- [ ] **Redeploy-ovao Netlify site** (OBAVEZNO!)
- [ ] Ažurirao Supabase Site URL na `https://prevezime.rs`
- [ ] Dodao `https://prevezime.rs/**` u Supabase Redirect URLs
- [ ] Dodao `https://prevezime.rs/auth/callback` u Google OAuth
- [ ] Testirao Google login na `https://prevezime.rs/prijava`
- [ ] Testirao push notifications

---

## 🚀 Status

**Kod:** ✅ Ažuriran - koristi dinamički domain  
**Netlify:** ⏳ Čeka redeploy  
**Supabase:** ⏳ Čeka ažuriranje URL konfiguracije  
**Google OAuth:** ⏳ Čeka dodavanje redirect URI-a  

---

**Nakon što ažuriraš sve ovo, aplikacija će raditi na `prevezime.rs` bez problema!** 🎉

