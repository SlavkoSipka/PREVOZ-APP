# 🔴 Real-Time Osvežavanje - Setup Uputstvo

## 📋 Pregled

Implementirali smo **real-time osvežavanje podataka** za:
- ✅ **Poslodavac Feed** - vidi sve ture uživo
- ✅ **Poslodavac Dashboard** - statistike i ture se osvežavaju automatski
- ✅ **Vozač Dashboard** - dostupne ture i prijave se osvežavaju uživo

## 🚀 Korak 1: Omogući Realtime na Supabase

### Opcija A: Kroz Supabase Dashboard (GUI)

1. Idi na [Supabase Dashboard](https://app.supabase.com)
2. Izaberi svoj projekat
3. Idi na **Database** → **Replication**
4. Pronađi **supabase_realtime** publication
5. Dodaj sledeće tabele:
   - `public.ture`
   - `public.prijave`
   - `public.users`
   - `public.notifikacije`
   - `public.uplate`

### Opcija B: Kroz SQL Editor (Preporučeno)

1. Otvori **SQL Editor** u Supabase Dashboard-u
2. Kopiraj i pokreni sadržaj fajla `supabase-enable-realtime.sql`:

```sql
-- Omogući realtime za ture
ALTER PUBLICATION supabase_realtime ADD TABLE public.ture;

-- Omogući realtime za prijave
ALTER PUBLICATION supabase_realtime ADD TABLE public.prijave;

-- Omogući realtime za users
ALTER PUBLICATION supabase_realtime ADD TABLE public.users;

-- Omogući realtime za notifikacije
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifikacije;

-- Omogući realtime za uplate
ALTER PUBLICATION supabase_realtime ADD TABLE public.uplate;
```

3. Klikni **Run** da izvršiš SQL

## 🔍 Korak 2: Proveri da li Realtime radi

Pokreni ovaj SQL upit:

```sql
SELECT 
    schemaname,
    tablename
FROM 
    pg_publication_tables
WHERE 
    pubname = 'supabase_realtime'
ORDER BY 
    tablename;
```

Treba da vidiš sledeće tabele u rezultatima:
- `notifikacije`
- `prijave`
- `ture`
- `uplate`
- `users`

## ✨ Šta sada radi automatski?

### Za Poslodavce:

#### Feed stranica (`/poslodavac/feed`)
- 🔄 Automatski se osvežava kada:
  - Nova tura bude objavljena
  - Tura bude odobrena/odbijena od admina
  - Status ture se promeni
  - Nova prijava vozača stigne

#### Dashboard (`/poslodavac`)
- 🔄 Automatski se osvežava kada:
  - Dodaš novu turu
  - Tura promeni status
  - Stigne nova prijava vozača
  - Vozač završi turu

### Za Vozače:

#### Dashboard (`/vozac`)
- 🔄 Automatski se osvežava kada:
  - Nova tura bude objavljena
  - Tvoja prijava bude odobrena/odbijena
  - Status ture se promeni
  - Tura bude dodeljena drugom vozaču

## 🎯 Dodatne Karakteristike

### Live Indicator
Svaka stranica sada ima **"Uživo"** indikator sa pulsing zelenom tačkom:
```
🟢 Uživo osvežavanje
```

### Ručno Osvežavanje
Korisnici mogu i dalje ručno da osvežavaju podatke klikom na dugme **"Osveži"** sa refresh ikonom.

### Optimizacija
- Real-time subscriptions se automatski cleanup-uju kada korisnik napusti stranicu
- Nema nepotrebnih API poziva - podaci se osvežavaju samo kada se nešto stvarno promeni

## 🔧 Troubleshooting

### Realtime ne radi?

1. **Proveri Supabase connection:**
   - Otvori Developer Console (F12)
   - Traži poruke kao: `"Ture change detected"` ili `"Prijave change detected"`

2. **Proveri da li su tabele dodane u publication:**
   - Pokreni SQL upit iz Koraka 2

3. **Proveri da li postoje greške:**
   - Otvori Console u browser-u
   - Traži bilo kakve error poruke povezane sa Supabase

### Još uvek ne radi?

- Restartuj aplikaciju: `npm run dev`
- Očisti browser cache i reload stranicu
- Proveri da li imaš najnoviju verziju Supabase paketa

## 📝 Tehnički Detalji

### Korišćene Tehnologije
- **Supabase Realtime:** WebSocket-based real-time subscriptions
- **React Hooks:** `useEffect` za lifecycle management
- **Client Components:** Omogućavaju state management i subscriptions

### Arhitektura
```
Server Component (Initial Load)
    ↓
Client Component (Real-time Updates)
    ↓
Supabase Realtime Subscription
    ↓
Automatic UI Update
```

## ⚡ Performanse

- **Nema polling-a** - podaci se osvežavaju samo kada se stvarno promene
- **Optimizovani upiti** - učitavamo samo potrebne kolone
- **Efficient cleanup** - subscriptions se automatski uklanjaju

## 🎉 Gotovo!

Sada imaš potpuno funkcionalnu real-time aplikaciju! 

Sve promene na platformi će biti vidljive **trenutno** bez potrebe za ručnim refresh-om. 🚀

