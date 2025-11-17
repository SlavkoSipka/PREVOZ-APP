# 📬 Admin Direktne Notifikacije - Dokumentacija

## 🎯 Pregled

Admin može sada da pošalje direktnu tekstualnu notifikaciju bilo kom korisniku (vozač ili poslodavac) sa njihove stranice profila.

---

## ✨ Funkcionalnosti

### **1. Gde admin može da pošalje notifikaciju?**

**Stranica:** `/admin/korisnici/[id]`

Kada admin otvori profil bilo kog korisnika, vidi dugme **"Pošalji notifikaciju"** u gornjem desnom uglu osnovne kartice sa informacijama.

### **2. Kako radi?**

1. **Admin klikne** na dugme "Pošalji notifikaciju"
2. **Otvara se dialog** sa poljem za unos poruke
3. **Admin unese** tekstualnu poruku (minimalno 1 karakter)
4. **Admin klikne** "Pošalji notifikaciju"
5. **Notifikacija se kreira** u bazi sa tipom `'admin_poruka'`
6. **Korisnik dobija** notifikaciju u svom panelu u real-time

---

## 📋 Tehnički detalji

### **Komponenta:**
```
components/admin/posalji-notifikaciju-dialog.tsx
```

### **Props:**
- `korisnikId` (string) - UUID korisnika
- `korisnikIme` (string) - Puno ime ili naziv firme
- `korisnikUloga` ('vozac' | 'poslodavac') - Uloga korisnika

### **Notifikacija struktura:**
```typescript
{
  vozac_id: string,        // ID korisnika (vozač ili poslodavac)
  tip: 'admin_poruka',     // Tip notifikacije
  poruka: string,          // Tekst koji je admin uneo
  procitano: false         // Default nepročitano
}
```

---

## 🔔 Kako korisnik vidi notifikaciju?

### **Za vozača:**
- Stranica: `/vozac/notifikacije`
- Zvonce u navbaru prikazuje broj nepročitanih

### **Za poslodavca:**
- Stranica: `/poslodavac/notifikacije`
- Zvonce u navbaru prikazuje broj nepročitanih

### **Prikaz notifikacije:**
```
📬 Poruka od administratora

[Tekst poruke koji je admin uneo]
```

Ikonica: 📧 Mail (plava)
Boja pozadine: Svetlo plava

---

## ⚙️ Preduslov - SQL Setup

**Da bi ovo radilo, potrebno je da budu pokrenute SQL skripte:**

### **1. ADD-ADMIN-PORUKA-TIP.sql**
Dodaje `'admin_poruka'` tip i RLS politike za admina.

### **2. ADD-POSLODAVAC-NOTIFIKACIJE-TIPOVI.sql**
Dodaje sve tipove notifikacija (uključujući `'admin_poruka'`) i `tura_id` kolonu.

---

## 🎨 UI/UX

### **Dugme lokacija:**
- **Pozicija:** Desno u CardHeader-u, ispod badge-ova sa statusom
- **Stil:** Outline button sa ikonom Mail

### **Dialog:**
- **Naslov:** "Pošalji notifikaciju korisniku"
- **Opis:** Prikazuje ime korisnika i njegovu ulogu
- **Polje:** Textarea sa 6 redova
- **Dugmad:** "Otkaži" i "Pošalji notifikaciju"

### **Validacija:**
- Poruka ne sme biti prazna
- Dugme "Pošalji" je disabled dok poruka nije uneta

### **Feedback:**
- Loading state na dugmetu: "Šaljem..."
- Toast poruka na uspeh: "✅ Notifikacija poslata!"
- Toast poruka na grešku: "Greška pri slanju notifikacije"

---

## 🧪 Testiranje

### **Scenario 1: Admin šalje notifikaciju vozaču**
1. Prijavi se kao **admin**
2. Idi na `/admin/korisnici/[vozac-id]`
3. Klikni "Pošalji notifikaciju"
4. Unesi tekst: "Molim vas da ažurirate saobracajnu dozvolu."
5. Klikni "Pošalji notifikaciju"
6. Prijavi se kao **vozač**
7. Proveri `/vozac/notifikacije`
8. ✅ Trebalo bi da vidiš notifikaciju

### **Scenario 2: Admin šalje notifikaciju poslodavcu**
1. Prijavi se kao **admin**
2. Idi na `/admin/korisnici/[poslodavac-id]`
3. Klikni "Pošalji notifikaciju"
4. Unesi tekst: "Vaša tura je odobrena!"
5. Klikni "Pošalji notifikaciju"
6. Prijavi se kao **poslodavac**
7. Proveri `/poslodavac/notifikacije`
8. ✅ Trebalo bi da vidiš notifikaciju

---

## 📊 Real-time

Notifikacije se prikazuju **u real-time** bez potrebe za refresh-om stranice:
- Korisnik vidi notifikaciju čim admin pošalje
- Broj nepročitanih se automatski ažurira u navbaru
- Koristi Supabase Realtime subscription

---

## 🔒 Sigurnost

### **RLS Politike:**

**Za INSERT (kreiranje notifikacije):**
```sql
CREATE POLICY "Admin moze da kreira notifikacije"
ON public.notifikacije
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid() 
    AND uloga = 'admin'
  )
)
```

**Za SELECT (čitanje notifikacija):**
```sql
CREATE POLICY "Korisnici mogu da vide svoje notifikacije"
ON public.notifikacije
FOR SELECT
USING (vozac_id = auth.uid())
```

Ovo osigurava da:
- ✅ Samo admin može da kreira notifikacije
- ✅ Korisnici mogu da vide samo svoje notifikacije
- ❌ Korisnici ne mogu da kreiraju notifikacije jedni drugima

---

## 🚀 Deployment Checklist

Kada deploy-uješ na production:

- [ ] Pokreni `ADD-ADMIN-PORUKA-TIP.sql` u Supabase
- [ ] Pokreni `ADD-POSLODAVAC-NOTIFIKACIJE-TIPOVI.sql` u Supabase
- [ ] Testiraj slanje notifikacije sa admin naloga
- [ ] Testiraj prijem notifikacije za vozača
- [ ] Testiraj prijem notifikacije za poslodavca
- [ ] Proveri da li real-time radi
- [ ] Proveri da li se broj nepročitanih ažurira

---

## 📝 Dodatne napomene

- Poruka može biti **bilo kakav tekst** (nema karakternog limita u bazi)
- Preporučena dužina poruke: **50-200 karaktera** za čitljivost
- Poruka **ne podržava HTML** - samo običan tekst
- Korisnik može da **obriše** notifikaciju iz svog panela
- Admin može da pošalje **više notifikacija** istom korisniku

---

## 🎉 Koristi ovu funkcionalnost za:

✅ Obaveštavanje korisnika o važnim izmenama  
✅ Slanje podsećanja  
✅ Obaveštavanje o problemima sa profilom  
✅ Slanje čestitki ili motivacionih poruka  
✅ Direktna komunikacija sa korisnicima  

---

**Autor:** AI Assistant  
**Datum:** 2024  
**Verzija:** 1.0  

