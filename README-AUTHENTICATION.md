# 🔐 Authentication Setup - Quick Reference

## ✅ **TRENUTNO AKTIVNO**

**Samo Email/Password prijava:**
- `/prijava` - Login
- `/registracija` - Register
- Email confirmation je **OBAVEZNO**

**Google OAuth:** ❌ **UKLONJEN** (pravio je probleme)

---

## 🚀 **BRZI START**

### **1. Proveri Supabase Settings**
```
Supabase Dashboard → Authentication → Settings

✅ Enable email confirmations: ON
✅ Confirm email: ON
```

### **2. Proveri Site URL**
```
Supabase Dashboard → Settings → API

Site URL: https://prevezime.rs

Redirect URLs:
- https://prevezime.rs/auth/callback
- https://prevezime.rs/select-role
```

### **3. Test Registraciju**
```
1. Otvori https://prevezime.rs/registracija
2. Unesi email + password
3. Klikni "Kreiraj nalog"
4. Proveri email inbox (i spam)
5. Klikni confirmation link
6. Trebao bi da te vrati na /select-role

✅ Ako sve radi - gotovo!
```

---

## 📧 **EMAIL CONFIRMATION**

**Obavezno uključeno:**
- User MORA da potvrdi email pre login-a
- Confirmation link ističe nakon 24h
- Može da pošalje novi link sa "Pošalji ponovo"

**Ako email ne stiže:**
1. Proveri spam folder
2. Proveri Supabase logs (Dashboard → Auth → Logs)
3. Proveri email rate limit (max 3/hour, 10/day)

---

## 📖 **DOKUMENTACIJA**

**Detaljno:**
- 📄 `EMAIL-AUTHENTICATION-SETUP.md` - Kompletan email auth setup
- 📄 `GOOGLE-OAUTH-UKLONJEN.md` - Šta je uklonjeno i zašto

**Izmenjeni fajlovi:**
- `app/prijava/page.tsx` - Login stranica
- `app/registracija/page.tsx` - Register stranica

---

## 🛠️ **TROUBLESHOOTING**

### **Problem: "Email nije stigao"**
```
Rešenje:
1. Spam folder
2. Klikni "Pošalji ponovo"
3. Proveri Supabase logs
```

### **Problem: "Email not confirmed"**
```
Rešenje:
1. Proveri email inbox
2. Klikni confirmation link
3. Ako je link istekao, pošalji novi
```

### **Problem: "Invalid link"**
```
Rešenje:
1. Link ističe posle 24h
2. Pošalji novi confirmation email
```

---

✅ **Email authentication radi stabilno!** 🎉

Za više detalja, čitaj `EMAIL-AUTHENTICATION-SETUP.md`

