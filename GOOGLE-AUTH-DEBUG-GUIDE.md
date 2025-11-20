# 🐛 Google OAuth Debug Guide

## Trenutni Problem

Google OAuth ne radi ni u incognito → Problem je u **implementaciji** ili **konfiguraciji**.

---

## ✅ Što Sam Dodao Za Debugging

### 1. **Console Logging**
Dodao sam logove u:
- `lib/auth-helpers.client.ts` - loguje redirect URL
- `app/auth/callback/route.ts` - loguje ceo flow

### 2. **Poboljšan Cookie Handling** (`lib/supabase/client.ts`)
Eksplicitno definisao kako se PKCE code verifier čuva u cookies.

---

## 🔍 Kako Testirati

### 1. **Otvori Console (F12)** pre nego što klikneš "Login with Google"

### 2. **Klikni "Login with Google"** i gledaj console

**Što treba da vidiš:**
```
🔐 Google OAuth redirect URL: https://prevezime.rs/auth/callback
✅ Google OAuth initiated successfully
```

**Ako vidiš greške**, kopiraj ih!

### 3. **Posle redirect-a nazad**, proveri console ponovo

**Što treba da vidiš:**
```
🔄 Auth callback hit: { hasCode: true, error: null, ... }
✅ Got authorization code, exchanging for session...
```

**Ako vidiš:**
```
❌ Auth exchange error: ...
```
→ Kopiraj celu grešku!

---

## 🔧 Moguća Rešenja

### Problem 1: "Invalid redirect_uri"
**Uzrok**: Google OAuth nije dobio tačan redirect URI.

**Proveri**:
1. **Supabase** → Authentication → URL Configuration → **Site URL** = `https://prevezime.rs`
2. **Supabase** → Authentication → URL Configuration → **Redirect URLs** = `https://prevezime.rs/**`
3. **Google Cloud Console** → Credentials → **Authorized redirect URIs** = 
   - `https://prevezime.rs/auth/callback`
   - `https://[supabase-id].supabase.co/auth/v1/callback`

### Problem 2: "Code verifier missing"
**Uzrok**: PKCE code verifier nije sačuvan u cookies između redirect-ova.

**Proveri**:
- Otvori **DevTools** → **Application** → **Cookies**
- Pre redirect-a, trebaš imati cookie koji počinje sa `sb-`
- Ako NEMA cookie-a → cookies su blokirani ili ne rade pravilno

**Rešenje**:
```javascript
// Dodao sam custom cookie handling u lib/supabase/client.ts
```

### Problem 3: "NEXT_PUBLIC_SITE_URL nije postavljen"
**Uzrok**: Environment variable nije prisutna tokom build-a.

**Proveri console log**, trebalo bi da piše:
```
🔐 Google OAuth redirect URL: https://prevezime.rs/auth/callback
```

Ako piše `http://localhost:3000/auth/callback` → **env variable NIJE postavljen!**

**Rešenje**:
1. Netlify → Site settings → Environment variables → Dodaj `NEXT_PUBLIC_SITE_URL`
2. **REDEPLOY Netlify site** (mora!)

### Problem 4: "OAuth consent screen nije konfigurisan"
**Uzrok**: Google OAuth consent screen nije setup.

**Rešenje**:
1. Google Cloud Console → APIs & Services → OAuth consent screen
2. Dodaj **Test users** (tvoj email)
3. Publish app ili dodaj email u test users

---

## 📋 Checklist - Uradi Redom

### Lokalno (Development):
- [ ] Push-ovao izmene sa debugging logovima
- [ ] Pokrenuo `npm run dev`
- [ ] Otvorio console (F12)
- [ ] Pokušao Google login
- [ ] Screenshot-ovao console log
- [ ] Kopiraj celu error poruku

### Netlify (Production):
- [ ] Environment variable `NEXT_PUBLIC_SITE_URL=https://prevezime.rs` postoji
- [ ] Redeploy-ovao site
- [ ] Supabase Site URL = `https://prevezime.rs`
- [ ] Supabase Redirect URLs uključuje `https://prevezime.rs/**`
- [ ] Google OAuth redirect URI uključuje `https://prevezime.rs/auth/callback`

---

## 🚨 Pošalji Mi Sledeće:

1. **Screenshot console loga** sa greškama
2. **Koju URL** koristiš (localhost ili prevezime.rs)?
3. **Kakva greška** se prikaže na stranici?
4. **Supabase Project ID** (iz Supabase Dashboard → Settings → General)

---

## 🎯 Quick Fix - Za Testiranje

Ako hoćeš brzo da testiraš DA LI JE PROBLEM U SUPABASE/GOOGLE KONFIGURACIJI:

1. Koristi **email/password login** umesto Google
2. Ako email/password RADI → problem je u OAuth setup-u
3. Ako email/password NE RADI → problem je u Supabase konekciji

---

**Sledeci korak**: Push izmene i testiraj sa console logovima! 🔍

