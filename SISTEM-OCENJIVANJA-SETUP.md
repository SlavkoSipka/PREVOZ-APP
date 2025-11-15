# ⭐ Setup: Sistem Ocenjivanja Vozača

Ova dokumentacija objašnjava kako da omogućite kompletan sistem za ocenjivanje vozača.

---

## 📋 Šta je Novo?

### Funkcionalnosti:

1. ✅ **Poslodavac ocenjuje vozača** nakon završene ture
2. ✅ **Ocena 1-5 zvezdi** sa opcionim komentarom
3. ✅ **Automatska notifikacija** vozaču kada dobije ocenu
4. ✅ **Javni prikaz ocena** na profilu vozača
5. ✅ **Prosečna ocena** vidljiva svima
6. ✅ **Real-time ažuriranje** ocena
7. ✅ **Izmena ocena** (poslodavac može da ažurira svoju ocenu)

---

## 🚀 Kako Instalirati?

### Korak 1: Pokreni SQL Skriptu u Supabase

1. Otvori **Supabase Dashboard**
2. Idi na **SQL Editor**
3. Pokreni skriptu `supabase-dodaj-ocene.sql`
4. Klikni **RUN**

**VAŽNO:** Ako dobiješ grešku prilikom ocenjivanja vozača:
- Pokreni `supabase-fix-ocene-rls.sql` za brzu popravku RLS policy-ja

### Korak 2: Primeni SQL Skriptu za Završavanje Tura (ako već nisi)

Sistem ocenjivanja zavisi od sistema završavanja tura:

```sql
-- Pokreni i ovu skriptu ako već nisi
-- Fajl: supabase-dodaj-status-zavrseno.sql
```

### Korak 3: Restart Dev Servera

```bash
npm run dev
```

---

## 🔍 Šta je Izmenjeno?

### 1. Baza Podataka

**Nova Tabela: `ocene`**

```sql
CREATE TABLE public.ocene (
  id UUID PRIMARY KEY,
  tura_id UUID REFERENCES ture(id),
  vozac_id UUID REFERENCES users(id),
  poslodavac_id UUID REFERENCES users(id),
  ocena INTEGER CHECK (ocena >= 1 AND ocena <= 5),
  komentar TEXT,
  created_at TIMESTAMP
)
```

**Ograničenja:**
- Jedan poslodavac može da oceni vozača samo **jednom po turi**
- Samo poslodavac čija je tura može da oceni
- Tura mora biti **završena** (`status = 'zavrsena'`)

**RLS Politike:**
- ✅ Svi autentifikovani korisnici mogu da **čitaju** ocene (javne)
- ✅ Samo poslodavac može da **kreira** ocenu za svoju završenu turu
- ✅ Samo poslodavac može da **ažurira/obriše** svoju ocenu

**Funkcije:**
- `prosecna_ocena_vozaca(vozac_id)` - Izračunava prosečnu ocenu
- `broj_ocena_vozaca(vozac_id)` - Broji ukupan broj ocena
- `notifikuj_vozaca_o_oceni()` - Automatski šalje notifikaciju

### 2. TypeScript Tipovi

**File: `types/database.types.ts`**

```typescript
export interface Ocena {
  id: string
  tura_id: string
  vozac_id: string
  poslodavac_id: string
  ocena: number
  komentar?: string | null
  created_at: string
  poslodavac?: {
    puno_ime: string
    naziv_firme?: string | null
  }
  tura?: {
    polazak: string
    destinacija: string
    datum: string
  }
}
```

### 3. Nove Komponente

**File: `components/poslodavac/oceni-vozaca-dialog.tsx`**
- Dialog za ocenjivanje vozača
- 5 interaktivnih zvezdi
- Opciono polje za komentar (do 500 karaktera)
- Mogućnost izmene postojeće ocene

### 4. Ažurirani Fajlovi

**File: `app/poslodavac/ture/[id]/page.tsx`**
- ✅ Prikazuje dugme "Oceni vozača" na završenim turama
- ✅ Prikazuje dugme "Izmeni ocenu" ako je vozač već ocenjen
- ✅ Učitava postojeću ocenu

**File: `app/vozac/profil/page.tsx`**
- ✅ Prikazuje prosečnu ocenu u headeru
- ✅ Lista svih ocena sa komentarima
- ✅ Prikazuje ko je ocenio i za koju turu

**File: `components/dashboard/navbar.tsx`**
- ✅ Popravljen hydration error

---

## 📊 Kako Radi?

### 1. Poslodavac Ocenjuje Vozača

Kada poslodavac završi turu i odobri vozača:

1. Poslodavac otvara turu u svom dashboardu
2. Ako je tura završena, vidi dugme **"Oceni vozača"**
3. Klikne na dugme
4. Otvara se dialog sa:
   - 5 zvezdi za ocenjivanje
   - Polje za komentar (opciono)
5. Klikne **"Oceni"**

**Šta se dešava u bazi:**

```typescript
// 1. Kreira se ocena
INSERT INTO ocene (tura_id, vozac_id, poslodavac_id, ocena, komentar)

// 2. Automatski se kreira notifikacija (trigger)
INSERT INTO notifikacije (vozac_id, tip, poruka)
VALUES (vozac_id, 'nova_ocena', '⭐ [Poslodavac] vas je ocenio sa 5/5...')
```

### 2. Vozač Prima Notifikaciju

- 🔔 Notifikacija se pojavljuje u navbaru
- 📨 Vozač može da klikne na notifikacije i vidi poruku
- ⭐ Poruka sadrži: ime poslodavca, ocenu, i komentar (ako postoji)

### 3. Prikazivanje Ocena

**Na profilu vozača:**
- Prosečna ocena u headeru (npr. **4.8** ⭐)
- Broj ocena (npr. "8 ocena")
- Lista svih ocena sa:
  - Broj zvezdi
  - Ime poslodavca/firme
  - Info o turi
  - Datum ocenjivanja
  - Komentar (ako postoji)

**Javno dostupno:**
- Ocene su vidljive svim autentifikovanim korisnicima
- Poslodavci mogu da vide profile vozača pre nego što ih angažuju

---

## 🎨 UI/UX Detalji

### Interaktivne Zvezde

```jsx
<Star className={`h-8 w-8 ${
  star <= ocena 
    ? 'fill-yellow-400 text-yellow-400'  // Puna zvezda
    : 'text-gray-300'                     // Prazna zvezda
}`} />
```

### Hover Efekat

- Prelazak mišem preko zvezdi prikazuje privremenu ocenu
- Animacija `hover:scale-110` za bolji UX

### Boje i Stilovi

- 🟡 Žuta (#FFC107) za zvezde
- 🔵 Plava za komentare
- ✅ Zelena za uspešne akcije

---

## 🔄 Real-Time Ažuriranje

Ocene se automatski ažuriraju uživo zahvaljujući Supabase Realtime:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.ocene;
```

Kada poslodavac oceni vozača:
- ✅ Ocena se odmah prikazuje na profilu
- ✅ Notifikacija stiže vozaču u real-time
- ✅ Prosečna ocena se automatski preračunava

---

## 🧪 Test Scenario

### 1. Kreiranje i Završavanje Ture

1. **Poslodavac** objavljuje turu
2. **Vozač** se prijavljuje
3. **Admin** odobrava vozača
4. **Vozač** završava turu
5. Tura dobija status `zavrsena`
6. Prijava dobija status `zavrseno`

### 2. Ocenjivanje Vozača

1. **Poslodavac** idi na "Moje ture" → "Završene"
2. Otvori završenu turu
3. U sekciji "Dodeljeni vozač" vidi dugme **"Oceni vozača"**
4. Klikne na dugme
5. Bira ocenu (npr. 5 zvezdi)
6. Upiše komentar: "Odličan vozač, sve na vreme!"
7. Klikne **"Oceni"**
8. Vidi poruku: **"✅ Uspešno! Vozač je ocenjen."**

### 3. Vozač Prima Notifikaciju

1. **Vozač** vidi crveni badge na Bell ikoni (🔔)
2. Klikne na notifikacije
3. Vidi notifikaciju: **"⭐ [Firma] vas je ocenio sa 5/5..."**
4. Notifikacija se automatski označava kao pročitana

### 4. Prikaz na Profilu

1. **Vozač** idi na "Profil"
2. Vidi prosečnu ocenu u headeru: **5.0 ⭐**
3. Skroluje dole do sekcije "Ocene poslodavaca"
4. Vidi karticu sa:
   - ⭐⭐⭐⭐⭐ 5/5
   - Ime poslodavca
   - Info o turi
   - Komentar: "Odličan vozač, sve na vreme!"

### 5. Izmena Ocene

1. **Poslodavac** kasnije odluči da promeni ocenu
2. Otvori istu turu
3. Vidi dugme **"Izmeni ocenu"** umesto "Oceni vozača"
4. Klikne i menja ocenu na 4 zvezde
5. Ažurira komentar
6. Klikne **"Ažuriraj"**
7. Ocena se odmah ažurira na profilu vozača

---

## ⚠️ Važne Napomene

### Ograničenja

1. **Samo završene ture** mogu biti ocenjene
2. **Jedan poslodavac = jedna ocena po turi**
3. **Vozač ne može da oceni sam sebe**
4. **Ocena mora biti 1-5** (validacija u bazi)

### Sigurnost

- RLS politike osiguravaju da samo poslodavac može da oceni svoju turu
- Notifikacije se šalju automatski preko database trigger-a
- Komentar je opcioni (može biti NULL ili prazan string)

### Performanse

- Indexi na `vozac_id`, `tura_id`, `poslodavac_id`
- Query-i su optimizovani sa LIMIT
- Real-time ažuriranje ne opterećuje server

---

## 🎉 Gotovo!

Kompletan sistem ocenjivanja je funkcionalan!

**Proveri da:**
- ✅ SQL skripta je pokrenuta u Supabase
- ✅ Dev server je restartovan
- ✅ Test scenario prolazi bez greške

**Pitanja ili problemi?**
Proveri:
1. RLS politike u Supabase Dashboard
2. Real-time je omogućen za `ocene` tabelu
3. Notifikacije rade (test sa drugim funkcijama)

---

## 📈 Buduća Poboljšanja

- [ ] Filter ocena po broju zvezdi
- [ ] Prikazivanje prosečne ocene pored imena vozača u listi
- [ ] Email notifikacija za nove ocene
- [ ] Statistika ocena po mesecu/godini
- [ ] Odgovori vozača na komentare
- [ ] Prikaz top-rated vozača

---

**Autor:** AI Assistant  
**Datum:** 2025-11-14  
**Verzija:** 1.0

