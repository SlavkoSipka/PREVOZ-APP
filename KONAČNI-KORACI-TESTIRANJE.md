# KONAČNI KORACI ZA TESTIRANJE

## **ŠTA SI DOBIO:**

### ✅ **Uloga se postavlja TEK nakon onboarding-a**
- Korisnik može da se vrati ako slučajno klikne pogrešno dugme
- Baza ostaje čista - nema "napola završenih" profila

---

## **KORACI ZA POKRETANJE:**

### **KORAK 1: Pokreni SQL u Supabase**

1. Otvori **Supabase Dashboard**
2. Idi na **SQL Editor**
3. Otvori fajl: `FIX-ULOGA-NULL-ALLOWED.sql`
4. Kopiraj SVE i nalepi u SQL Editor
5. Klikni **Run** ili `Ctrl+Enter`

**Šta će se desiti:**
```
✅ ALTER TABLE - uloga može biti NULL
✅ CHECK constraint - dozvoljava NULL
✅ TRIGGER ažuriran - ne postavlja default 'vozac'
✅ UPDATE - svi profili resetovani na uloga=NULL
```

**Trebalo bi da vidiš:**
```
✅ GOTOVO! Uloga sada može biti NULL. 
   Postavlja se tek nakon onboarding-a.
```

---

### **KORAK 2: Odjavi se iz aplikacije**

```bash
# U aplikaciji klikni "Odjavi se"
# ILI u DevTools:
# Application → Storage → Clear site data
```

---

### **KORAK 3: Testiranje - Scenario 1 (Happy path)**

```
1. Idi na /registracija
2. Unesi email/password ili klikni Google
3. ✅ Trebalo bi: → /select-role

4. Klikni "Nastavi kao Vozač"
5. ✅ Trebalo bi: → /vozac-onboarding
6. ✅ Gore levo vidiš: "← Nazad" dugme

7. Popuni sve podatke (ime, prezime, telefon, grad, tablice, opis)
8. Klikni "Sačuvaj i nastavi"
9. ✅ Trebalo bi: → /vozac dashboard
```

---

### **KORAK 4: Testiranje - Scenario 2 (Slučajno kliknuo)**

```
1. Novi nalog ili odjavi se
2. Idi na /select-role
3. Klikni "Nastavi kao Vozač"
4. ✅ Trebalo bi: → /vozac-onboarding

5. ❗ Slučajno si kliknuo! Klikni "← Nazad"
6. ✅ Trebalo bi: → /select-role

7. Sada klikni "Nastavi kao Poslodavac"
8. ✅ Trebalo bi: → /poslodavac-onboarding

9. Popuni podatke i klikni "Sačuvaj"
10. ✅ Trebalo bi: → /poslodavac dashboard
```

**Proveri u bazi:**
```sql
SELECT email, uloga, profil_popunjen 
FROM public.users 
WHERE email = 'tvoj-email@gmail.com';

-- Trebalo bi:
-- uloga: 'poslodavac' ✅ (NE 'vozac'!)
-- profil_popunjen: true ✅
```

---

### **KORAK 5: Testiranje - Google OAuth**

```
1. Odjavi se
2. Idi na /registracija
3. Klikni "Nastavi sa Google"
4. ✅ Trebalo bi: → /select-role

5. Izaberi ulogu
6. ✅ Trebalo bi: → onboarding
7. Završi onboarding
8. ✅ Trebalo bi: → dashboard
```

---

## **PROVERA U TERMINALU:**

Kada testiraš, u terminalu gde ti radi `npm run dev` trebao bi da vidiš:

### **Nakon Google prijave:**
```
🔍 Auth callback - profil: { uloga: null, profil_popunjen: false }
➡️ REDIRECT: /select-role (nema uloga)
```

### **Nakon select-role:**
```
🔧 MIDDLEWARE CHECK: /vozac-onboarding
🔧 User data: { uloga: null, blokiran: false, profil_popunjen: false }
```

### **Nakon završenog onboarding-a:**
```
UPDATE users SET uloga='vozac', profil_popunjen=true WHERE ...
```

---

## **PROVERA U BAZI:**

### **PRE završenog onboarding-a:**
```sql
SELECT id, email, uloga, profil_popunjen, created_at
FROM public.users
WHERE email = 'test@example.com';
```

**Očekivani rezultat:**
```
uloga: null  ✅
profil_popunjen: false  ✅
```

### **POSLE završenog onboarding-a:**
```sql
SELECT id, email, uloga, profil_popunjen, ime, prezime
FROM public.users
WHERE email = 'test@example.com';
```

**Očekivani rezultat:**
```
uloga: 'vozac' ili 'poslodavac'  ✅
profil_popunjen: true  ✅
ime: 'Marko'  ✅
prezime: 'Marković'  ✅
```

---

## **CHECKLIST:**

- [ ] SQL skripta pokrenuta u Supabase
- [ ] Odjavio sam se iz app-a
- [ ] Test 1: Registracija → Select role → Onboarding → Dashboard ✅
- [ ] Test 2: Select role → Nazad dugme radi → Promeni izbor ✅
- [ ] Test 3: Google OAuth → Select role → Onboarding → Dashboard ✅
- [ ] Provera u bazi: uloga postavljena tek nakon onboarding-a ✅

---

## **AKO NEŠTO NE RADI:**

### **Problem 1: I dalje me šalje na vozač onboarding**
```sql
-- Proveri u bazi:
SELECT uloga FROM public.users WHERE email = 'tvoj-email@gmail.com';

-- Ako vidiš uloga='vozac', resetuj:
UPDATE public.users 
SET uloga = NULL, profil_popunjen = false 
WHERE email = 'tvoj-email@gmail.com';

-- Odjavi se i probaj ponovo
```

### **Problem 2: Greška pri čuvanju**
```sql
-- Možda CHECK constraint nije ažuriran:
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass 
  AND conname LIKE '%uloga%';

-- Trebalo bi da vidiš:
-- CHECK (uloga IS NULL OR uloga IN ('vozac', 'poslodavac', 'admin'))
```

### **Problem 3: Trigger i dalje postavlja 'vozac'**
```sql
-- Proveri trigger funkciju:
SELECT prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- NE bi trebalo da vidiš: COALESCE(..., 'vozac')
-- Trebalo bi: NEW.raw_user_meta_data->>'uloga'
```

---

## **✅ USPEŠNO AKO:**

1. **Registracija** → `/select-role` ✅
2. **Izabereš ulogu** → Onboarding stranica ✅
3. **"Nazad" dugme** radi ✅
4. **Završiš onboarding** → Dashboard ✅
5. **U bazi:** `uloga` postavljena tek nakon onboarding-a ✅

---

**Javi mi kako je prošlo testiranje!** 🚀

