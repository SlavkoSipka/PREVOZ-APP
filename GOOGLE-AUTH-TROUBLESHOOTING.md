# 🔧 Google Auth Problem - Korak po Korak Rešenje

## 🔴 Tvoj Problem
Google login radi na nekim telefonima, a na nekim ne. Vraća te na `/?error=auth_failed`

## ✅ URADI OVO REDOM:

### **Korak 1: Proveri Google Cloud Console** ⭐ NAJVAŽNIJE!

1. Idi na: https://console.cloud.google.com
2. Izaberi projekat (TransLink ili kako god si ga nazvao)
3. Idi na **APIs & Services** → **Credentials**
4. Klikni na OAuth 2.0 Client ID (trebalo bi da vidiš jedan)
5. Proveri **Authorized redirect URIs** - MORA da ima:

```
https://main--prevoz.netlify.app/auth/callback
https://prevoz.netlify.app/auth/callback
https://<tvoj-supabase-projekat>.supabase.co/auth/v1/callback
```

**Ako nema sve 3, DODAJ IH!**

6. Klikni **SAVE**

---

### **Korak 2: Proveri Supabase Settings**

1. Idi na **Supabase Dashboard** (https://app.supabase.com)
2. Klikni na tvoj projekat
3. **Settings** → **Authentication**
4. Scroll do **Site URL** i proveri da piše: `https://main--prevoz.netlify.app`
5. Proveri **Redirect URLs** - dodaj:
   ```
   https://main--prevoz.netlify.app/**
   https://prevoz.netlify.app/**
   ```
6. SAVE

---

### **Korak 3: Dodaj Environment Variable u Netlify**

1. Idi na **Netlify Dashboard**
2. Izaberi sajt (main--prevoz)
3. **Site settings** → **Environment variables**
4. Dodaj novu varijablu:
   - **Key**: `NEXT_PUBLIC_SITE_URL`
   - **Value**: `https://main--prevoz.netlify.app`
5. SAVE
6. **REDEPLOY sajt** (Deploys → Trigger deploy)

---

### **Korak 4: Testiranje**

Sada testiraj ponovo:

#### Na Telefonu:
1. **Android Chrome:**
   - Otvori Incognito tab
   - Idi na `https://main--prevoz.netlify.app/prijava`
   - Klikni "Nastavi sa Google"
   - Loguj se

2. **iOS Safari:**
   - Otvori Private Browsing
   - Idi na `https://main--prevoz.netlify.app/prijava`
   - Klikni "Nastavi sa Google"
   - Loguj se

#### Ako Opet Ne Radi:

URL će biti: `https://main--prevoz.netlify.app/?error=auth_failed&reason=...`

**Kopiraj ceo URL i pošalji mi!** Sada imam detalje greške pa mogu da vidim tačno šta je problem.

---

## 🔍 Moguće Greške i Rešenja

### Greška: "redirect_uri_mismatch"

**Uzrok:** Google Cloud Console nema ispravan redirect URI.

**Fix:**
1. Vrati se na **Korak 1**
2. Proveri da li je **TAČNo ovaj URL** dodat: `https://<supabase-id>.supabase.co/auth/v1/callback`
3. Pronađi svoj Supabase ID:
   - Supabase Dashboard → Project Settings → General
   - Reference ID je deo pre `.supabase.co`

---

### Greška: "access_denied" ili "consent_required"

**Uzrok:** Korisnik je otkazao login ili nešto nije u redu sa consent screen-om.

**Fix:**
1. Google Cloud Console → APIs & Services → **OAuth consent screen**
2. Proveri da je App name popunjen
3. Proveri da su email-ovi dodati
4. Proveri da je Status **In Production** (ne Testing)

---

### Greška: Prazna stranica ili infinite redirect

**Uzrok:** Problem sa cookies ili session storage.

**Fix:**
1. Na telefonu, otvori browser Settings
2. **Android Chrome:**
   - Settings → Site settings → Cookies
   - Uključi "Allow all cookies" (makar privremeno za test)
3. **iOS Safari:**
   - iOS Settings → Safari
   - Isključi "Block All Cookies"
   - Isključi "Prevent Cross-Site Tracking"
4. Pokušaj ponovo

---

## 📞 Kontakt za Dalje Debugovanje

Ako ni posle svega ne radi, pošalji mi:

1. **Screenshot** greške na telefonu
2. **Ceo URL** sa `?error=...&reason=...`
3. **Tip telefona** (npr. iPhone 13, Samsung Galaxy S21)
4. **Browser** (Chrome, Safari, Firefox)
5. **Da li je Incognito/Private mode**

---

## ✅ Šta Sam Uradio u Kodu

1. **Dodao detaljnije logovanje** u `app/auth/callback/route.ts`
   - Sada URL sadrži tačnu grešku: `?error=auth_failed&reason=<poruka>`

2. **Dodao error display** na homepage (`app/page.tsx`)
   - Ako login ne uspe, vidiš crveni banner sa objašnjenjem

3. **Poboljšao Google OAuth config** u `lib/auth-helpers.client.ts`
   - Dodao `access_type: 'offline'` za bolju kompatibilnost

4. **Kreirao dokumentaciju:**
   - `FIX-GOOGLE-AUTH-MOBILE.md` - detaljan troubleshooting guide
   - `GOOGLE-AUTH-TROUBLESHOOTING.md` - ovaj fajl

---

## 🎯 Očekivani Rezultat

Nakon **Koraka 1, 2, 3**:
- ✅ Google login radi na SVIM uređajima
- ✅ Ako ne radi, vidiš TAČNU grešku u URL-u
- ✅ Homepage prikazuje crveni banner sa objašnjenjem

---

## 💡 Pro Tip

Ako Google OAuth stalno pravi probleme, možeš da ga potpuno ukloniš i koristiš samo Email/Password. Ali pošto sam već popravio, trebalo bi da radi! 😊

---

**Pokreni deploy i testiraj!** 🚀

