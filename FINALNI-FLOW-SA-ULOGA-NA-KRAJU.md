# FINALNI FLOW - Uloga se postavlja TEK nakon onboarding-a

## **Kako sada radi:**

```
1. Registracija (Google ili Email)
   → Profil kreiran sa: uloga = NULL ✅
   
2. /select-role
   → Korisnik bira: Vozač ili Poslodavac
   → NE UPISUJE U BAZU! Samo sessionStorage
   → Redirect na onboarding
   
3. /vozac-onboarding ili /poslodavac-onboarding
   → Korisnik unosi SVE podatke
   → Ima "Nazad" dugme (ako je slučajno pogrešno kliknuo)
   
4. Klik "Sačuvaj i nastavi"
   → TEK SADA se upisuje: uloga + svi podaci
   → profil_popunjen = true
   
5. Dashboard
```

---

## **Zašto je ovo bolje:**

### ✅ **Prednost 1: Korisnik može da se predomisli**
```
Korisnik klikne "Vozač" slučajno
  → Ode na vozač onboarding
  → Klikne "Nazad"
  → Vraća se na /select-role
  → Bira "Poslodavac" ✅
```

### ✅ **Prednost 2: Baza ostaje čista**
```
Staro: uloga='vozac' (čak i ako nije završio)
Novo: uloga=NULL (dok ne završi onboarding) ✅
```

### ✅ **Prednost 3: Jednostavnije testiranje**
```
Možeš da testiraš flow koliko hoćeš
Ne ostaju "napola završeni" profili u bazi ✅
```

---

## **Tehnički detalji:**

### **1. SQL promene (FIX-ULOGA-NULL-ALLOWED.sql)**

```sql
-- 1. Dozvoli NULL za uloga
ALTER TABLE public.users 
ALTER COLUMN uloga DROP NOT NULL;

-- 2. Ažuriraj CHECK constraint
ALTER TABLE public.users 
ADD CONSTRAINT users_uloga_check 
CHECK (uloga IS NULL OR uloga IN ('vozac', 'poslodavac', 'admin'));

-- 3. Ažuriraj trigger - NE postavlja default 'vozac'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, uloga, puno_ime, telefon, profil_popunjen)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'uloga',  -- ✅ Može biti NULL!
    COALESCE(NEW.raw_user_meta_data->>'puno_ime', ''),
    COALESCE(NEW.raw_user_meta_data->>'telefon', ''),
    FALSE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **2. select-role promene**

```typescript
// STARO (loše):
await supabase.from('users').update({ uloga: role })

// NOVO (dobro):
sessionStorage.setItem('selected_role', role)  // Samo privremeno!
router.push('/vozac-onboarding')  // Još ništa nije upisano
```

### **3. Onboarding promene**

```typescript
// VOZAČ ONBOARDING
const handleSubmit = async () => {
  await supabase
    .from('users')
    .update({
      uloga: 'vozac',  // ✅ TEK SADA!
      ime: formData.ime,
      // ... svi ostali podaci
      profil_popunjen: true,
    })
}

// POSLODAVAC ONBOARDING - isto
```

---

## **Redosled izvršavanja:**

### **Korak 1: Pokreni SQL u Supabase**
```bash
# Otvori Supabase Dashboard → SQL Editor
# Kopiraj i pokreni: FIX-ULOGA-NULL-ALLOWED.sql
```

**Šta će se desiti:**
- Dozvoljava `uloga = NULL`
- Resetuje sve profile (osim admin-a) na `uloga = NULL`
- Trigger više ne postavlja default 'vozac'

### **Korak 2: Testiranje**
```
1. Odjavi se iz app-a
2. Prijavi se ponovo (Google ili email)
3. Trebalo bi: → /select-role ✅
4. Izaberi "Vozač"
5. Trebalo bi: → /vozac-onboarding ✅
6. Klikni "Nazad"
7. Trebalo bi: → /select-role ✅
8. Izaberi "Poslodavac"
9. Trebalo bi: → /poslodavac-onboarding ✅
10. Popuni podatke i klikni "Sačuvaj"
11. Trebalo bi: → /poslodavac dashboard ✅
```

---

## **Provera u bazi:**

### **PRE završenog onboarding-a:**
```sql
SELECT email, uloga, profil_popunjen 
FROM public.users 
WHERE email = 'test@gmail.com';

-- Rezultat:
-- uloga: null  ✅
-- profil_popunjen: false  ✅
```

### **POSLE završenog onboarding-a:**
```sql
SELECT email, uloga, profil_popunjen 
FROM public.users 
WHERE email = 'test@gmail.com';

-- Rezultat:
-- uloga: 'poslodavac'  ✅
-- profil_popunjen: true  ✅
```

---

## **Flow dijagram:**

```
                    REGISTRACIJA
                         │
                         ▼
               ┌─────────────────────┐
               │ PROFIL KREIRAN:     │
               │ uloga = NULL        │
               │ profil_popunjen = F │
               └──────────┬──────────┘
                          │
                          ▼
                   /select-role
                   Izaberi ulogu
                  ┌──────┴──────┐
                  │             │
            [Vozač]         [Poslodavac]
                  │             │
                  │    sessionStorage
                  │    (privremeno!)
                  │             │
                  ▼             ▼
        /vozac-onboarding  /poslodavac-onboarding
          │                     │
      [Nazad]              [Nazad]
          │                     │
          └─────────┬───────────┘
                    │
                    ▼
              Unesi podatke
                    │
                    ▼
         Klikni "Sačuvaj i nastavi"
                    │
                    ▼
          ┌─────────────────────┐
          │ UPDATE users:       │
          │ uloga = 'vozac'     │
          │ profil_popunjen = T │
          │ + svi podaci        │
          └──────────┬──────────┘
                     │
                     ▼
                 DASHBOARD
```

---

## **✅ PREDNOSTI:**

| Aspekt | Stari sistem | Novi sistem |
|--------|-------------|-------------|
| Kada se postavlja uloga | Odmah na select-role | Tek nakon onboarding-a ✅ |
| Ako korisnik slučajno klikne | Ne može da se vrati | Može "Nazad" dugme ✅ |
| Napola završeni profili | Ostaju u bazi | Ne postoje ✅ |
| Default vrednost | trigger postavlja 'vozac' | NULL dok ne završi ✅ |

---

## **Fajlovi promenjeni:**

1. ✅ `FIX-ULOGA-NULL-ALLOWED.sql` - SQL fix
2. ✅ `app/select-role/page.tsx` - Ne upisuje u bazu, samo sessionStorage
3. ✅ `app/vozac-onboarding/page.tsx` - Postavlja uloga tek na submit + "Nazad" dugme
4. ✅ `app/poslodavac-onboarding/page.tsx` - Isto + "Nazad" dugme

---

## **✅ GOTOVO!**

Sada korisnik može slobodno da se predomisli i sistem ne pravi "napola završene" profile! 🎉

