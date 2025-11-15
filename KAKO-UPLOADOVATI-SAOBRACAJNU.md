# Upload Saobraćajne Dozvole - Dokumentacija

## **ŠTA JE DODATO:**

### ✅ **Upload funkcionalnost za vozače**
Vozači sada moraju da uploaduju:
- **Prednju stranu** saobraćajne dozvole
- **Zadnju stranu** saobraćajne dozvole

### ✅ **Privacy Notice**
Lepo dizajniran notice koji objašnjava:
- Zašto se podaci prikupljaju (provera verodostojnosti)
- Kako se koriste (sprečavanje višestrukih registracija)
- Zaštita podataka (ne dele se sa trećim licima)

### ✅ **Checkbox za saglasnost**
Korisnik mora da potvrdi:
> "Saglasan sam sa obradom ovih podataka u navedene svrhe."

---

## **TEHNIČKI DETALJI:**

### **1. Storage Bucket**
```sql
-- Bucket: saobracajne-dozvole
-- Private (public = false)
-- Organizacija: {email}/dozvola-{napred|pozadi}-{timestamp}.{ext}
```

### **2. RLS Politike**
```sql
-- Korisnici mogu da uploaduju samo svoje slike
-- Korisnici mogu da vide samo svoje slike
-- Admin može da vidi sve slike
-- Korisnici mogu da ažuriraju/brišu samo svoje slike
```

### **3. Database Kolone**
```sql
ALTER TABLE users ADD COLUMN:
- saobracajna_napred TEXT (URL do slike prednje strane)
- saobracajna_pozadi TEXT (URL do slike zadnje strane)
- saobracajna_prihvacena BOOLEAN (Da li je admin prihvatio)
```

---

## **KORACI ZA POKRETANJE:**

### **KORAK 1: Pokreni SQL**
```bash
# Otvori: Supabase Dashboard → SQL Editor
# Kopiraj i pokreni: ADD-SAOBRACAJNA-DOZVOLA.sql
```

**Šta će se desiti:**
```
✅ Dodaju se kolone: saobracajna_napred, saobracajna_pozadi, saobracajna_prihvacena
✅ Kreira se Storage bucket: saobracajne-dozvole
✅ Postavljaju se RLS politike za bucket
```

### **KORAK 2: Testiraj flow**
```
1. Odjavi se
2. Registruj se kao vozač
3. Na vozač onboarding strani:
   - Popuni osnovne podatke
   - Uploaduj sliku prednje strane dozvole
   - Uploaduj sliku zadnje strane dozvole
   - Prihvati checkbox za saglasnost
   - Klikni "Sačuvaj i nastavi"
4. Trebalo bi: → /vozac dashboard ✅
```

---

## **UI KOMPONENTE:**

### **Upload Dugme - Stanja:**

#### **1. Prazno (Čeka upload)**
```
┌────────────────────────────────────┐
│  📤  Kliknite da uploadujete sliku │
└────────────────────────────────────┘
Border: Gray dashed
Hover: Primary border + primary background
```

#### **2. Uploadovanje**
```
┌────────────────────────────────────┐
│  ⏳  Uploadovanje...                │
└────────────────────────────────────┘
Border: Gray dashed
Opacity: 50%
Cursor: wait
```

#### **3. Uspešno uploadovano**
```
┌────────────────────────────────────┐
│  ✓  Prednja strana uploadovana ✓   │
└────────────────────────────────────┘
Border: Green solid
Background: Light green
```

### **Privacy Notice Box:**
```
┌─────────────────────────────────────────────┐
│ 🛡️ O zaštiti vaših podataka:                │
│                                             │
│ TransLink koristi fotografiju vaše          │
│ saobraćajne dozvole isključivo radi provere │
│ verodostojnosti naloga i sprečavanja        │
│ zloupotreba (višestrukih registracija).     │
│                                             │
│ Podaci se čuvaju bezbedno i ne dele se     │
│ sa trećim licima. Slanjem fotografije      │
│ saglasni ste sa ovim uslovima.             │
└─────────────────────────────────────────────┘
Background: Light blue
Border: Blue
```

### **Checkbox za saglasnost:**
```
┌─────────────────────────────────────────────┐
│ ☐ Saglasan sam sa obradom ovih podataka u   │
│   navedene svrhe. *                         │
└─────────────────────────────────────────────┘
Background: Light gray
Required: Yes
```

---

## **VALIDACIJE:**

### **1. Tip fajla**
```typescript
if (!file.type.startsWith('image/')) {
  toast('Molimo uploadujte sliku (JPEG, PNG, itd.)')
}
```

### **2. Veličina fajla**
```typescript
if (file.size > 5 * 1024 * 1024) {
  toast('Slika je prevelika. Maksimalna veličina je 5MB.')
}
```

### **3. Obe slike obavezne**
```typescript
if (!formData.saobracajna_napred || !formData.saobracajna_pozadi) {
  toast('Molimo uploadujte obe slike saobraćajne dozvole.')
}
```

### **4. Saglasnost obavezna**
```typescript
if (!saglasnost) {
  toast('Morate prihvatiti obradu podataka da biste nastavili.')
}
```

### **5. Submit dugme disabled dok:**
```typescript
disabled={
  loading || 
  uploadingNapred || 
  uploadingPozadi || 
  !saglasnost || 
  !formData.saobracajna_napred || 
  !formData.saobracajna_pozadi
}
```

---

## **FLOW DIJAGRAM:**

```
           VOZAČ ONBOARDING
                  │
                  ▼
      Popuni osnovne podatke
      (ime, prezime, telefon...)
                  │
                  ▼
    ┌──────────────────────────┐
    │ SAOBRAĆAJNA DOZVOLA      │
    ├──────────────────────────┤
    │ 🛡️ Privacy Notice         │
    │                          │
    │ 📤 Upload Prednja strana │ ← Obavezno
    │ 📤 Upload Zadnja strana  │ ← Obavezno
    │                          │
    │ ☑️ Checkbox saglasnost    │ ← Obavezno
    └──────────────────────────┘
                  │
                  ▼
          Klik "Sačuvaj"
                  │
        ┌─────────┴─────────┐
        │ Validacija:       │
        │ - Obe slike ✓     │
        │ - Saglasnost ✓    │
        └─────────┬─────────┘
                  │
                  ▼
      ┌──────────────────────┐
      │ UPDATE users:        │
      │ - uloga = 'vozac'    │
      │ - svi podaci         │
      │ - saobracajna_napred │
      │ - saobracajna_pozadi │
      │ - profil_popunjen=T  │
      └──────────┬───────────┘
                 │
                 ▼
           VOZAČ DASHBOARD
```

---

## **ADMIN FUNKCIONALNOST (Future):**

U budućnosti admin će moći da:
```
1. Vidi uploadovane slike vozača
2. Prihvati ili odbije saobraćajnu dozvolu
3. Ažurira: saobracajna_prihvacena = TRUE/FALSE
4. Blokira vozača ako je slika nevažeća
```

---

## **SECURITY:**

### **✅ RLS Politike**
- Vozač vidi samo svoje slike
- Admin vidi sve slike
- Niko drugi ne može videti slike

### **✅ Private Bucket**
- Nije javno dostupan
- Mora da se koristi Supabase Auth

### **✅ File Path Structure**
```
{email}/dozvola-{napred|pozadi}-{timestamp}.{ext}
```
- Svaki korisnik ima svoj folder sa email-om kao imenom
- Lakše pretraživanje u Storage-u
- Ne može da pristupa tuđim slikama

---

## **TESTIRANJE:**

### **Test 1: Upload slike**
```
1. Klikni na upload dugme
2. Izaberi sliku
3. Trebalo bi: 
   - Prikaz "Uploadovanje..."
   - Toast notification "Uspešno!"
   - Zelena oznaka ✓
```

### **Test 2: Validacija tipa**
```
1. Pokušaj da uploaduješ PDF
2. Trebalo bi: Toast "Molimo uploadujte sliku"
```

### **Test 3: Validacija veličine**
```
1. Pokušaj da uploaduješ sliku > 5MB
2. Trebalo bi: Toast "Slika je prevelika"
```

### **Test 4: Submit bez slika**
```
1. Popuni podatke
2. NE uploaduj slike
3. Klikni "Sačuvaj"
4. Trebalo bi: Toast "Molimo uploadujte obe slike"
```

### **Test 5: Submit bez saglasnosti**
```
1. Uploaduj slike
2. NE čekiraj checkbox
3. Klikni "Sačuvaj" (dugme disabled)
4. Ako nekako klikneš: Toast "Morate prihvatiti obradu"
```

---

## **FAJLOVI PROMENJENI:**

1. ✅ `ADD-SAOBRACAJNA-DOZVOLA.sql` - SQL setup
2. ✅ `app/vozac-onboarding/page.tsx` - Upload UI i logika
3. ✅ `types/database.types.ts` - Database types ažurirani

---

## **✅ GOTOVO!**

Vozači sada moraju da uploaduju saobraćajnu dozvolu tokom onboarding-a! 🎉

