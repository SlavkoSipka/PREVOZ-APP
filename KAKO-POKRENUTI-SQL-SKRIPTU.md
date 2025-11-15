# 🚀 Kako pokrenuti SQL skriptu u Supabase

## **KORACI ZA POKRETANJE (5 minuta)**

---

### **KORAK 1: Otvori Supabase Dashboard**

1. Idi na: **https://supabase.com**
2. **Prijavi se** na svoj nalog
3. **Klikni** na svoj projekat (TransLink ili kako god se zove)

---

### **KORAK 2: Otvori SQL Editor**

1. U **levom meniju**, pronađi i klikni na **"SQL Editor"**
   - Ikona izgleda kao `</>` ili terminal
2. Otvoriće se SQL Editor stranica

---

### **KORAK 3: Kreiraj novi Query**

1. Klikni na **"New Query"** dugme (gore desno)
2. Otvoriće se prazan SQL editor

---

### **KORAK 4: Kopiraj SQL skriptu**

#### **OPCIJA A: Proveri prvo da li ti trebaju politike**

1. Otvori fajl: **`PROVERI-RLS-POLITIKE.sql`**
2. Kopiraj **SVE** (Ctrl+A, Ctrl+C)
3. Nalepi u Supabase SQL Editor (Ctrl+V)
4. Klikni **"RUN"** ili pritisni **F5**
5. Pogledaj rezultate:
   - Ako vidiš **4 politike za `ocene`** → Skip na Korak 6 (testiranje)
   - Ako **NE vidiš 4 politike** → Nastavi sa Opcijom B

#### **OPCIJA B: Pokreni fix skriptu**

1. Otvori fajl: **`POKRENI-OVO-ZA-FIX.sql`**
2. Kopiraj **SVE** (Ctrl+A, Ctrl+C)
3. Nalepi u Supabase SQL Editor (Ctrl+V)
4. Klikni **"RUN"** ili pritisni **F5**
5. Čekaj da se izvrši (2-3 sekunde)

---

### **KORAK 5: Proveri da li je uspelo**

Nakon što pokreneš skriptu, trebalo bi da vidiš poruku:

```
✅ RLS politika za završavanje tura kreirana!
✅ RLS politike za ocenjivanje kreirane!
🎉 SKRIPTA USPEŠNO IZVRŠENA!
```

I trebalo bi da vidiš **listu politika** na dnu.

---

### **KORAK 6: Testiraj u aplikaciji**

#### **Test 1: Ocenjivanje vozača**

1. Otvori aplikaciju u browser-u
2. **Otvori Developer Console** (F12)
3. Prijavi se kao **poslodavac**
4. Idi na **Dashboard** → Nađi **završenu turu**
5. Klikni **"Oceni vozača"**
6. Izaberi ocenu (1-5 ⭐)
7. Klikni **"Oceni"**
8. **Pogledaj Console (F12)** - trebalo bi da vidiš:
   ```
   ➕ Kreiram novu ocenu: {tura_id: "...", vozac_id: "...", ...}
   ✅ Insert result: {data: [...], error: null}
   ```

#### **Test 2: Završavanje ture (vozač)**

1. Prijavi se kao **vozač**
2. Otvori **dodeljenu turu**
3. Klikni **"Završio sam turu"**
4. Potvrdi
5. Trebalo bi da te redirectuje na **`/uplata-obavezna`**

---

## **🔍 AKO NE RADI - DEBUGGING**

### **Problem 1: Console prikazuje `❌ Insert error: {}`**

**Rešenje:**
1. Proveri Console log, trebalo bi da vidiš:
   ```
   🔑 Auth user ID: ...
   🔑 Vozac ID: ...
   🔑 Tura ID: ...
   ✅ Error full: {...}
   ```
2. Ako piše `"Row Level Security blokira..."` → Pokreni SQL skriptu ponovo
3. Ako piše `"Ovaj vozač nije bio dodeljen ovoj turi"` → Refresh browser (Ctrl+Shift+R)

---

### **Problem 2: "Tabela 'ocene' ne postoji"**

**Rešenje:**
1. Otvori Supabase → **Table Editor**
2. Proveri da li postoji tabela **`ocene`**
3. Ako NE postoji, pokreni skriptu: **`supabase-dodaj-ocene.sql`**

---

### **Problem 3: SQL skripta ne radi**

**Rešenje:**
1. Kopiraj skriptu **liniju po liniju** i pokreni je delovima
2. Ili napravi **screenshot greške** i pošalji mi

---

## **📋 QUICK CHECKLIST**

Pre nego što testiraj, proveri:

- [ ] Pokrenuo sam **`POKRENI-OVO-ZA-FIX.sql`** u Supabase
- [ ] Pokrenuo sam **`PROVERI-RLS-POLITIKE.sql`** i video **4 politike za ocene**
- [ ] Refresh-ovao sam browser (Ctrl+Shift+R) nakon SQL promene
- [ ] Otvorio sam **Developer Console (F12)** pre testiranja
- [ ] Prijavio sam se kao **poslodavac** za test ocenjivanja
- [ ] Imam **završenu turu** sa dodeljenim vozačem

---

## **🎯 ŠTA TAČNO RADI SQL SKRIPTA?**

### **Za Ocenjivanje:**
Briše stare politike i kreira 4 nove:
1. **SELECT** - Svi mogu da čitaju ocene
2. **INSERT** - Poslodavac može da kreira ocenu (proverava samo `poslodavac_id = auth.uid()`)
3. **UPDATE** - Poslodavac može da ažurira svoju ocenu
4. **DELETE** - Poslodavac može da obriše svoju ocenu

### **Za Završavanje Tura:**
Dodaje novu politiku:
- **UPDATE** - Vozač može da završi svoju dodeljenu turu (samo status → 'zavrsena')

---

## **💡 HINT**

Ako i dalje ne radi nakon što si pokrenuo SQL skriptu:
1. **Izloguj se** iz aplikacije
2. **Refresh browser** (Ctrl+Shift+R)
3. **Prijavi se ponovo**
4. **Testiraj**

Ovo osvežava auth session i cache.

---

**Sad pokreni SQL skriptu i testiraj!** 🚀

