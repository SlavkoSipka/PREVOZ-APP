# 🔧 Fix: Google Auth na Mobilnim Uređajima

## 🔴 Problem
Google OAuth login radi na nekim telefonima, ali ne na svima. Vraća grešku: `?error=auth_failed`

## 🔍 Uzroci
1. **Cookie problemi** - Neki mobilni browseri blokiraju third-party cookies
2. **Redirect URL** - Može biti problem sa relativnim vs apsolutnim URL-ovima
3. **PKCE flow** - Supabase koristi PKCE za OAuth koji može imati probleme na mobilnim uređajima
4. **Session storage** - Problemi sa localStorage/sessionStorage na mobilnim browserima

## ✅ Rešenja

### 1. **Proveri Google Cloud Console Authorized Redirect URIs**

Uveriti se da su dodati SVI mogući redirect URL-ovi:

```
https://main--prevoz.netlify.app/auth/callback
https://prevoz.netlify.app/auth/callback
https://your-domain.com/auth/callback
https://<your-project>.supabase.co/auth/v1/callback
```

**Kako dodati:**
1. Idi na https://console.cloud.google.com
2. APIs & Services → Credentials
3. Klikni na OAuth 2.0 Client ID
4. Dodaj sve URL-ove u **Authorized redirect URIs**
5. SAVE

### 2. **Proveri Supabase Site URL**

U **Supabase Dashboard**:
1. Project Settings → General
2. **Site URL** mora biti: `https://main--prevoz.netlify.app` (ili tvoj production URL)
3. **Redirect URLs** dodaj:
   ```
   https://main--prevoz.netlify.app/**
   https://prevoz.netlify.app/**
   ```

### 3. **Dodaj Environment Variables u Netlify**

1. Idi na **Netlify Dashboard** → Site settings → Environment variables
2. Dodaj:
   ```
   NEXT_PUBLIC_SITE_URL=https://main--prevoz.netlify.app
   ```
3. **Redeploy** sajt

### 4. **Testiranje na Mobilnim Uređajima**

#### Android Chrome
1. Otvori Chrome Incognito
2. Idi na `https://main--prevoz.netlify.app/prijava`
3. Klikni "Nastavi sa Google"
4. Loguj se

#### iOS Safari
1. Otvori Safari Private Browsing
2. Idi na `https://main--prevoz.netlify.app/prijava`
3. Klikni "Nastavi sa Google"
4. Loguj se

### 5. **Detaljnije Logovanje Grešaka**

Promenio sam `app/auth/callback/route.ts` da loguje više informacija:

```typescript
// Sada će URL biti:
/?error=auth_failed&reason=<error_message>

// Umesto samo:
/?error=auth_failed
```

**Kako videti grešku:**
1. Pokušaj login na mobilnom uređaju
2. Ako ne uspe, URL će biti: `https://.../?error=auth_failed&reason=...`
3. Kopiraj `reason=...` deo i pošalji mi da vidimo šta je problem

### 6. **Česta Greška: "redirect_uri_mismatch"**

Ako vidiš ovu grešku, znači da redirect URI u Google Cloud Console NE ODGOVARA redirect URI-ju koji Supabase šalje.

**Fix:**
1. Otvori Network tab u Chrome DevTools (na desktopu)
2. Pokreni Google login
3. Pronađi request ka `accounts.google.com/o/oauth2/v2/auth`
4. Kopiraj **redirect_uri** parametar
5. Dodaj TAJ URL u Google Cloud Console → Authorized redirect URIs

### 7. **Problem sa Third-Party Cookies**

Neki mobilni browseri blokiraju third-party cookies po defaultu.

**Test:**
1. Android Chrome → Settings → Site settings → Cookies
2. Uključi "Allow third-party cookies"
3. Pokušaj ponovo

**iOS Safari:**
1. Settings → Safari
2. Isključi "Block All Cookies"
3. Isključi "Prevent Cross-Site Tracking"
4. Pokušaj ponovo

### 8. **Fallback: Email/Password Login**

Ako Google OAuth ne radi na mobilnom uređaju, uvek može da se koristi Email/Password registracija koja funkcioniše 100%.

## 🧪 Debug Checklist

- [ ] Proveren Google Cloud Console Authorized redirect URIs
- [ ] Proveren Supabase Site URL
- [ ] Dodato `NEXT_PUBLIC_SITE_URL` u Netlify env vars
- [ ] Redeployed sajt posle izmena
- [ ] Testiran na Android Chrome
- [ ] Testiran na iOS Safari
- [ ] Proveren da li mobilni browser blokira third-party cookies
- [ ] Provereni console logs za detaljne greške

## 📝 Dodatne Napomene

### Zašto radi na nekim telefonima a ne na svima?

1. **Browser settings** - Različiti browseri imaju različite default cookie settings
2. **OS verzija** - Stariji Android/iOS mogu imati probleme sa PKCE flow-om
3. **VPN/Proxy** - Može da ometa OAuth flow
4. **Ad blockers** - Mogu da blokiraju OAuth redirecte

### Šta ako ni posle svega ne radi?

**Opcija 1:** Prisiliti korisnike da koriste Email/Password
**Opcija 2:** Implementirati drugačiji OAuth flow (implicit flow umesto PKCE)
**Opcija 3:** Kontaktirati Supabase support za pomoć

## 🎯 Očekivani Rezultat

Nakon ovih izmena:
- ✅ Google OAuth radi na svim uređajima
- ✅ Detaljnije greške za debugging
- ✅ Bolji UX sa loading state-ovima

## 🆘 Ako Problem Ostane

Pošalji:
1. Screenshot greške na mobilnom
2. URL sa `?error=...&reason=...` parametrima
3. Tip telefona i browser verziju
4. Da li je Incognito/Private mode

I možemo dalje da debugujemo!

