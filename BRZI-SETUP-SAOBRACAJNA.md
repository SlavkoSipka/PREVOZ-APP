# ⚡ BRZI SETUP - Upload Saobraćajne Dozvole

## **SAMO 2 KORAKA:**

### **1️⃣ Pokreni SQL u Supabase**
```bash
# Otvori: Supabase Dashboard → SQL Editor
# Fajl: ADD-SAOBRACAJNA-DOZVOLA.sql
# Klikni: Run (ili Ctrl+Enter)
```

**Rezultat:**
```
✅ Dodaju se kolone u users tabelu
✅ Kreira se Storage bucket
✅ Postavljaju se RLS politike
```

---

### **2️⃣ Testiraj**
```
1. Odjavi se iz app-a
2. Registruj se kao vozač
3. Na onboarding strani uploaduj slike dozvole
4. Prihvati checkbox za saglasnost
5. Klikni "Sačuvaj i nastavi"
6. ✅ Uspeh!
```

---

## **ŠTA SE DESILO:**

### **Dodato na Vozač Onboarding:**

```
┌─────────────────────────────────────┐
│ 🛡️ Saobraćajna dozvola              │
├─────────────────────────────────────┤
│                                     │
│ [Privacy Notice - Plavi box]       │
│                                     │
│ 📤 Prednja strana dozvole *         │
│ [Upload dugme]                      │
│                                     │
│ 📤 Zadnja strana dozvole *          │
│ [Upload dugme]                      │
│                                     │
│ ☑️ Saglasan sam sa obradom podataka │
│                                     │
│ [Sačuvaj i nastavi]                 │
└─────────────────────────────────────┘
```

### **Validacije:**
- ✅ Obe slike **obavezne**
- ✅ Max veličina: **5MB**
- ✅ Tipovi: **JPEG, PNG, WebP**
- ✅ Checkbox **obavezan**

---

## **Privacy Notice tekst:**

> **TransLink** koristi fotografiju vaše saobraćajne dozvole **isključivo radi provere verodostojnosti naloga** i sprečavanja zloupotreba (višestrukih registracija).
> 
> Podaci se čuvaju bezbedno i **ne dele se sa trećim licima**. Slanjem fotografije saglasni ste sa ovim uslovima.

---

## **Provera u bazi:**

```sql
SELECT 
  email,
  saobracajna_napred,
  saobracajna_pozadi,
  saobracajna_prihvacena
FROM public.users
WHERE uloga = 'vozac';
```

**Trebalo bi:**
```
saobracajna_napred: test@example.com/dozvola-napred-{timestamp}.jpg
saobracajna_pozadi: test@example.com/dozvola-pozadi-{timestamp}.jpg
saobracajna_prihvacena: false (za sada, dok admin ne odobri)
```

**Prednost:** Folderi u Storage-u su imenovani po email-u, tako da lako pronađeš vozača!

---

## **Ako nešto ne radi:**

### **Problem: Bucket ne postoji**
```sql
-- Proveri:
SELECT * FROM storage.buckets WHERE id = 'saobracajne-dozvole';

-- Ako je prazan, pokreni ponovo ADD-SAOBRACAJNA-DOZVOLA.sql
```

### **Problem: Upload ne radi**
```sql
-- Proveri RLS politike:
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- Trebalo bi da vidiš 5 politika za saobracajne-dozvole
```

---

**Detaljna dokumentacija:** `KAKO-UPLOADOVATI-SAOBRACAJNU.md`

**✅ Gotovo!** 🚀

