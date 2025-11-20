# 📧 Email Authentication - Kompletna Dokumentacija

**Datum:** 20. novembar 2024  
**Status:** ✅ Aktivno (Google OAuth uklonjen)

---

## ✅ **ŠTATREBATE ZNATI**

### **1. Samo Email/Password Prijava**
- ✅ Registracija: `/registracija`
- ✅ Prijava: `/prijava`
- ❌ Google OAuth: **UKLONJEN** (pravio je probleme)

### **2. Email Confirmation Flow**
```
1. User unese email + password na /registracija
   ↓
2. Supabase šalje CONFIRMATION EMAIL
   ↓
3. User klikne link u email-u
   ↓
4. Supabase potvrđuje email
   ↓
5. User se redirect-uje na /select-role
   ↓
6. User izabere ulogu (vozač ili poslodavac)
   ↓
7. User popunjava profil (onboarding)
   ↓
8. User pristupa dashboard-u
```

---

## 🔧 **SUPABASE AUTHENTICATION SETTINGS**

### **1. Email Confirmation (OBAVEZNO)**

**Gde:** Supabase Dashboard → Authentication → Email Templates

#### **Confirm signup template:**
```html
<h2>Potvrdite vaš email</h2>
<p>Pratite ovaj link da potvrdite svoj email:</p>
<p><a href="{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email">Potvrdite email</a></p>
```

**Važno:**
- ✅ **Enable email confirmations:** `ON`
- ✅ **Confirmation URL:** `{{ .SiteURL }}/auth/callback`

---

### **2. Site URL Configuration**

**Gde:** Supabase Dashboard → Settings → API → Site URL

```
Site URL: https://prevezime.rs
```

**Redirect URLs:**
```
https://prevezime.rs/auth/callback
https://prevezime.rs/select-role
https://prevezime.rs/vozac-onboarding
https://prevezime.rs/poslodavac-onboarding
```

---

### **3. Email Auth Settings**

**Gde:** Supabase Dashboard → Authentication → Providers → Email

```
✅ Email provider: ENABLED
✅ Confirm email: ENABLED (obavezno!)
✅ Secure email change: ENABLED
✅ Secure password change: ENABLED
```

**Email Rate Limits:**
```
Max emails per hour: 3
Max emails per day: 10
```

---

## 📱 **REGISTRACIJA FLOW**

### **Frontend: `/app/registracija/page.tsx`**

```typescript
const { data, error } = await signUp(
  email,
  password,
  {
    puno_ime: '',
    telefon: '',
    uloga: null, // Još ne znamo ulogu
  },
  { emailRedirectTo: `${window.location.origin}/select-role` }
)
```

**Šta se dešava:**
1. ✅ Supabase kreira user account (ali nije potvrdjen)
2. ✅ Šalje confirmation email na user-ov email
3. ✅ User vidi stranicu `/registracija/uspesno` sa porukom da proveri email
4. ✅ User klikne link u email-u
5. ✅ Supabase potvrđuje email i redirect na `/select-role`

---

## 🔐 **PRIJAVA FLOW**

### **Frontend: `/app/prijava/page.tsx`**

```typescript
const { data, error } = await signIn(email, password)

if (data.user) {
  // Učitaj profil
  const { data: profile } = await supabase
    .from('users')
    .select('uloga, profil_popunjen')
    .eq('id', data.user.id)
    .single()

  // Redirect logika
  if (!profile || !profile.uloga) {
    router.push('/select-role')
  } else if (!profile.profil_popunjen) {
    const onboardingPath = profile.uloga === 'vozac' 
      ? '/vozac-onboarding' 
      : '/poslodavac-onboarding'
    router.push(onboardingPath)
  } else {
    const dashboardPath = profile.uloga === 'vozac' 
      ? '/vozac' 
      : '/poslodavac'
    router.push(dashboardPath)
  }
}
```

**Provere:**
1. ✅ Da li user ima ulogu? → Ako NE, idi na `/select-role`
2. ✅ Da li je profil popunjen? → Ako NE, idi na onboarding
3. ✅ Sve OK? → Idi na dashboard

---

## 📧 **EMAIL CONFIRMATION PAGE**

### **Success Page: `/app/registracija/uspesno/page.tsx`**

Prikazuje se nakon registracije:

```
✅ Nalog kreiran!

Poslali smo vam email sa linkom za potvrdu naloga.

📧 Proverite svoj inbox na: user@example.com

Nije stigao email?
- Proverite spam folder
- Kliknite "Pošalji ponovo" da dobijete novi link
```

---

## 🔄 **AUTH CALLBACK HANDLER**

### **Backend: `/app/auth/callback/route.ts`**

```typescript
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
    }
    
    // Uspešno! User je sada ulogovan
    // Redirect na /select-role ili dashboard
    return NextResponse.redirect(new URL('/select-role', request.url))
  }
}
```

**Šta radi:**
1. ✅ Prima `code` iz URL-a (iz confirmation email linka)
2. ✅ Razmeni `code` za session token
3. ✅ Kreira logged-in session za user-a
4. ✅ Redirect na `/select-role` ili dashboard

---

## 🚨 **TROUBLESHOOTING**

### **Problem: "Email nije stigao"**

**Proveri:**
1. ✅ Spam folder
2. ✅ Da li je email tačan?
3. ✅ Da li je Supabase email delivery OK? (Supabase Dashboard → Auth → Logs)

**Rešenje:**
- Korisnik može da klikne "Pošalji ponovo" na `/registracija/uspesno` strani

---

### **Problem: "Invalid or expired confirmation link"**

**Uzrok:**
- Confirmation link ističe nakon **24h**
- Link je već iskorišten

**Rešenje:**
```typescript
// Resend confirmation email
const { error } = await supabase.auth.resend({
  type: 'signup',
  email: userEmail,
})
```

---

### **Problem: "User već postoji"**

**Uzrok:**
- Email već registrovan

**Rešenje:**
- Korisnik treba da ode na `/prijava` i da se prijavi
- Ili da koristi "Reset password" ako je zaboravio lozinku

---

## 🛡️ **SECURITY BEST PRACTICES**

### **1. Password Requirements**
```typescript
// Minimum 6 karaktera (može se povećati)
minLength={6}
```

**Preporuka:** Povećaj na 8+ karaktera za produkcionu aplikaciju

---

### **2. Rate Limiting**
Supabase automatski limitira:
- ✅ Max 3 emails/hour po user-u
- ✅ Max 10 emails/day po user-u

Sprečava spam i abuse.

---

### **3. Email Verification**
- ✅ **OBAVEZNO UKLJUČENO** (ne može da se loguje bez potvrde)
- ✅ Štiti od fake registracija

---

## 📊 **EMAIL TEMPLATES**

### **1. Confirmation Email**
```
Subject: Potvrdite vaš email - PrevezIme

Zdravo!

Hvala što ste se registrovali. Kliknite link ispod da potvrdite svoj email:

[Potvrdite email] → https://prevezime.rs/auth/callback?token_hash=xxx

Link ističe za 24h.

Ako niste kreirali nalog, ignorišite ovaj email.
```

---

### **2. Password Reset Email**
```
Subject: Resetovanje lozinke - PrevezIme

Zdravo!

Zahtevali ste resetovanje lozinke. Kliknite link ispod:

[Resetuj lozinku] → https://prevezime.rs/auth/callback?token_hash=xxx&type=recovery

Link ističe za 1h.

Ako niste zahtevali reset, ignorišite ovaj email.
```

---

## 🧪 **TESTIRANJE**

### **Test Scenario 1: Nova Registracija**
```
1. Otvori /registracija
2. Unesi email + password (min 6 chars)
3. Klikni "Kreiraj nalog"
4. Proveri inbox
5. Klikni confirmation link
6. Trebao bi da te redirect-uje na /select-role
✅ SUCCESS
```

### **Test Scenario 2: Prijava Bez Confirmation**
```
1. Registruj se (ali NE klikni confirmation link)
2. Pokušaj da se loguješ
✅ OČEKIVANO: Error "Email not confirmed"
```

### **Test Scenario 3: Resend Confirmation**
```
1. Na /registracija/uspesno
2. Klikni "Pošalji ponovo"
3. Proveri inbox
4. Novi email stigao
✅ SUCCESS
```

---

## 🎯 **SUMMARY**

### ✅ **ŠTA RADI:**
- Email/Password registracija
- Email confirmation (obavezno)
- Password reset
- Secure session management

### ❌ **ŠTA NE RADI (UKLONJENO):**
- Google OAuth login
- Google OAuth registration

### 📝 **ENVIRONMENT VARIABLES:**
```bash
# Netlify env
NEXT_PUBLIC_SITE_URL=https://prevezime.rs
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
```

---

✅ **Email authentication je STABILAN i RADI!** 🎉

