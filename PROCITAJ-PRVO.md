# 📋 PROČITAJ PRVO - Authentication Setup

**Datum:** 20. novembar 2024  
**Šta je urađeno:** Google OAuth uklonjen, ostao samo Email/Password

---

## ✅ **ŠTO JE URAĐENO**

1. ✅ **Uklonjeno Google OAuth dugme** sa `/prijava` i `/registracija`
2. ✅ **Ostao samo Email/Password** login i registracija
3. ✅ **Email confirmation je obavezno** - user mora da potvrdi email

---

## 🚨 **ŠTA TI TREBA DA PROVERIŠ U SUPABASE**

### **Korak 1: Email Confirmation**
```
Otvori: Supabase Dashboard → Authentication → Settings

Proveri:
✅ "Enable email confirmations" = ON
✅ "Confirm email" = ON
```

**Zašto:** Bez ovoga, user može da se registruje ali neće moći da se loguje.

---

### **Korak 2: Site URL**
```
Otvori: Supabase Dashboard → Settings → API

Proveri:
✅ Site URL = https://prevezime.rs

Redirect URLs:
✅ https://prevezime.rs/auth/callback
✅ https://prevezime.rs/select-role
```

**Zašto:** Mora da bude tačan URL da bi email confirmation link radio.

---

### **Korak 3: Email Templates**
```
Otvori: Supabase Dashboard → Authentication → Email Templates

Proveri "Confirm signup" template:
✅ Link u email-u = {{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email
```

**Zašto:** Confirmation link mora da pokazuje na pravilan callback URL.

---

## 🧪 **TESTIRANJE**

### **Test 1: Registracija**
```
1. Otvori: https://prevezime.rs/registracija
2. Unesi email i password
3. Klikni "Kreiraj nalog"
4. Otvori email inbox
5. Klikni confirmation link

✅ Trebalo bi da radi!
```

### **Test 2: Login**
```
1. Otvori: https://prevezime.rs/prijava
2. Unesi email i password
3. Klikni "Prijavi se"

✅ Trebalo bi da radi!
```

---

## 🚨 **AKO NE RADI**

### **Email nije stigao:**
1. Proveri spam folder
2. Proveri Supabase logs (Dashboard → Auth → Logs)
3. Proveri da li je rate limit OK (max 3 emails/hour)

### **"Email not confirmed" error:**
1. User mora da klikne link u email-u
2. Link ističe posle 24h
3. Može da pošalje novi sa "Pošalji ponovo"

---

## 📄 **DOKUMENTACIJA**

**Quick Reference:**
- 📄 `README-AUTHENTICATION.md` - Brzi pregled

**Detaljno:**
- 📄 `EMAIL-AUTHENTICATION-SETUP.md` - Technical setup guide
- 📄 `GOOGLE-OAUTH-UKLONJEN.md` - Šta je uklonjeno
- 📄 `FINALNO-RESENJE-AUTHENTICATION.md` - Kompletan summary

---

## 🚀 **DEPLOYMENT**

```bash
# 1. Commit
git add .
git commit -m "Remove Google OAuth, use Email/Password only"

# 2. Push
git push

# 3. Wait for Netlify build (3-5 min)

# 4. Test na: https://prevezime.rs
```

---

## 🎯 **CHECKLIST**

Proveri da li je SVE urađeno:

- [ ] Supabase: Email confirmation = ON
- [ ] Supabase: Site URL = https://prevezime.rs
- [ ] Supabase: Email templates = OK
- [ ] Git: Commit i push
- [ ] Netlify: Build prošao
- [ ] Test: Registracija radi
- [ ] Test: Email stigao
- [ ] Test: Confirmation link radi
- [ ] Test: Login radi

---

✅ **Ako sve radi - GOTOVO!** 🎉

**Javi mi ako nešto ne radi ili imaš pitanja!** 📧

