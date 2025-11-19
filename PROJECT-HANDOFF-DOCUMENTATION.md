# 🚀 TransLink - Kompletan Projekat Dokumentacija

**Datum:** 14. Novembar 2025  
**Verzija:** 1.0  
**Framework:** Next.js 15.5.6 (App Router)  
**Database:** Supabase (PostgreSQL)  
**Styling:** Tailwind CSS + Shadcn UI  

---

## 📋 PREGLED PROJEKTA

**TransLink** je platforma za povezivanje poslodavaca (transportnih kompanija) i vozača. Poslodavci objavljuju ture, vozači se prijavljuju, a admin odobrava najbolje kandidate.

### Uloge u Sistemu:
1. **Vozač** - Prima ture, vozi, plaća proviziju
2. **Poslodavac/Firma** - Objavljuje ture, ocenjuje vozače
3. **Admin** - Odobrava ture i vozače, upravlja sistemom

---

## 🏗️ TEHNIČKI STACK

```
Frontend:
- Next.js 15.5.6 (App Router, Server Components)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn UI komponente

Backend:
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Realtime
- Row Level Security (RLS)

Payment:
- 2Checkout integracija
```

---

## 📁 STRUKTURA PROJEKTA

```
Prevoz APP/
├── app/
│   ├── admin/              # Admin dashboard
│   ├── vozac/              # Vozač dashboard
│   │   ├── prijave/        # Moje prijave page
│   │   ├── profil/         # Profil vozača (sa ocenama)
│   │   ├── notifikacije/   # Notifikacije page
│   │   └── ture/[id]/      # Detalji ture
│   ├── poslodavac/         # Poslodavac dashboard
│   │   ├── feed/           # Objave (sve ture)
│   │   ├── objavi-turu/    # Forma za novu turu
│   │   └── ture/[id]/      # Detalji ture
│   ├── firma/              # Alternativna ruta za poslodavca
│   └── api/
│       └── webhook/
│           └── 2checkout/  # Payment webhook
│
├── components/
│   ├── admin/              # Admin komponente
│   ├── vozac/              # Vozač komponente
│   │   ├── dashboard-content.tsx
│   │   ├── moje-prijave-content.tsx
│   │   ├── notifikacije-content.tsx
│   │   ├── prihvati-turu-button.tsx
│   │   └── zavrsi-turu-button.tsx
│   ├── poslodavac/         # Poslodavac komponente
│   │   ├── dashboard-content.tsx
│   │   ├── feed-content.tsx
│   │   └── oceni-vozaca-dialog.tsx
│   ├── dashboard/
│   │   └── navbar.tsx      # Glavni navbar (sa notifikacijama)
│   └── ui/                 # Shadcn UI komponente
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Client-side Supabase
│   │   └── server.ts       # Server-side Supabase
│   ├── auth-helpers.client.ts
│   ├── auth-helpers.server.ts
│   └── utils.ts            # Utility funkcije (formatVreme, cn)
│
├── types/
│   └── database.types.ts   # TypeScript interfejsi
│
└── SQL Skripte/            # Sve SQL migracije
    ├── POKRENI-OVO-U-SUPABASE.sql
    ├── supabase-dodaj-status-zavrseno.sql
    ├── supabase-dodaj-ocene.sql
    ├── supabase-add-notifikacije.sql
    └── ... (ostale skripte)
```

---

## 🗄️ DATABASE SCHEMA

### Glavne Tabele:

#### 1. `users` (Korisnici)
```sql
- id: UUID (primarni ključ, referencira auth.users)
- uloga: TEXT ('vozac', 'poslodavac', 'admin')
- email: TEXT
- puno_ime: TEXT
- telefon: TEXT
- naziv_firme: TEXT (za poslodavce)
- registarske_tablice: TEXT (za vozače)
- verifikovan: BOOLEAN
- blokiran: BOOLEAN
- razlog_blokiranja: TEXT
- vreme_automatske_blokade: TIMESTAMP
```

#### 2. `ture` (Ture/Prevozi)
```sql
- id: UUID
- firma_id: UUID (referencira users)
- polazak: TEXT
- destinacija: TEXT
- datum: DATE
- vreme_polaska: TEXT (format: HH:MM)
- opis_robe: TEXT
- ponudjena_cena: NUMERIC
- status: TEXT ('aktivna', 'na_cekanju', 'dodeljena', 'zavrsena')
- dodeljeni_vozac_id: UUID
- tacna_adresa_polazak: TEXT
- tacna_adresa_destinacija: TEXT
- kontakt_telefon: TEXT
- kontakt_email: TEXT
- dodatne_napomene: TEXT
- faktura: TEXT ('da', 'ne', 'nije_obavezna')
```

#### 3. `prijave` (Prijave vozača)
```sql
- id: UUID
- tura_id: UUID (referencira ture)
- vozac_id: UUID (referencira users)
- status: TEXT ('ceka_admina', 'odobreno', 'odbijeno', 'zavrseno')
- razlog_odbijanja: TEXT
- created_at: TIMESTAMP
UNIQUE(tura_id, vozac_id) -- Vozač može prijaviti samo jednom
```

#### 4. `uplate` (Provizije)
```sql
- id: UUID
- vozac_id: UUID
- tura_id: UUID
- iznos: NUMERIC
- status: TEXT ('u_toku', 'placeno', 'neuspesno')
- checkout_id: TEXT
```

#### 5. `notifikacije` (Notifikacije za vozače)
```sql
- id: UUID
- vozac_id: UUID (referencira users)
- prijava_id: UUID (opciono)
- tip: TEXT ('odobreno', 'odbijeno', 'nova_ocena', 'uplata_potrebna')
- poruka: TEXT
- procitano: BOOLEAN
- created_at: TIMESTAMP
```

#### 6. `ocene` (Ocene vozača)
```sql
- id: UUID
- tura_id: UUID (referencira ture)
- vozac_id: UUID (referencira users)
- poslodavac_id: UUID (referencira users)
- ocena: INTEGER (1-5)
- komentar: TEXT
- created_at: TIMESTAMP
UNIQUE(tura_id, vozac_id, poslodavac_id)
```

---

## 🔐 ROW LEVEL SECURITY (RLS)

Sve tabele imaju RLS omogućen. Politike:

### `users`
- Svi autentifikovani korisnici mogu da čitaju
- Samo admin može da menja blokiran/verifikovan

### `ture`
- Svi mogu da čitaju ture
- Samo poslodavac može da kreira/ažurira svoje ture
- Admin može da ažurira status

### `prijave`
- Vozač vidi svoje prijave
- Poslodavac vidi prijave za svoje ture
- Admin vidi sve

### `ocene`
- Svi mogu da čitaju (javne ocene)
- Samo poslodavac može da oceni svoju završenu turu
- Poslodavac može da ažurira/obriše svoju ocenu

### `notifikacije`
- Vozač vidi samo svoje notifikacije
- Sistem kreira notifikacije automatski

---

## ⚡ REALTIME SETUP

Sledeće tabele imaju Realtime omogućen:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.ture;
ALTER PUBLICATION supabase_realtime ADD TABLE public.prijave;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifikacije;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ocene;
```

### Kako Realtime Radi:

**Client Components** se pretplaćuju na promene:

```typescript
const channel = supabase
  .channel('table-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'ture' },
    () => { loadData() }
  )
  .subscribe()
```

Koristi se u:
- `components/vozac/dashboard-content.tsx`
- `components/poslodavac/dashboard-content.tsx`
- `components/poslodavac/feed-content.tsx`
- `components/vozac/moje-prijave-content.tsx`
- `components/vozac/notifikacije-content.tsx`
- `components/dashboard/navbar.tsx`

---

## 🔄 LIFE CYCLE TURA

```
1. KREIRANJE
   Poslodavac → Objavi turu → Status: 'na_cekanju'

2. ODOBRAVANJE (Admin)
   Admin → Odobri turu → Status: 'aktivna'

3. PRIJAVA
   Vozač → Prijavi se → Prijava status: 'ceka_admina'

4. ODOBRAVANJE VOZAČA (Admin)
   Admin → Odobri vozača → Tura status: 'dodeljena'
                        → Prijava status: 'odobreno'
                        → Ostale prijave: 'odbijeno'

5. ZAVRŠAVANJE
   Vozač → "Završio sam turu" → Tura status: 'zavrsena'
                              → Prijava status: 'zavrseno'
                              → Kreira se uplata (status: 'u_toku')
                              → Vozač se blokira
                              → Šalje se notifikacija

6. PLAĆANJE
   Vozač → Plati proviziju → Uplata status: 'placeno'
                           → Vozač se deblokira

7. OCENJIVANJE
   Poslodavac → Oceni vozača → Kreira se ocena
                             → Vozač dobija notifikaciju
```

---

## 🔧 KLJUČNE FUNKCIJE (PostgreSQL)

⚠️ **NAPOMENA**: Automatske funkcije za blokiranje su **UKLONJENE**!

### Uklonjena automatska logika:
- ❌ `auto_blokiraj_vozaca_za_odbijenu_turu()` - OBRISANA
- ❌ `proveri_i_blokiraj_vozaca()` - OBRISANA
- ❌ `proveri_sve_odobrene_ture_vozaca()` - OBRISANA
- ❌ `moze_se_prijaviti_na_turu()` - OBRISANA
- ❌ `trigger_proveri_vozaca_pre_prijave` - OBRISAN

### Kako sada radi blokiranje:
- ✅ **Samo admin** može ručno da blokira/deblokira korisnike
- ✅ Admin ima RLS politike da može da menja `blokiran` kolonu
- ✅ UI sprečava vozača da se prijavljuje ako je blokiran

### 4. `prosecna_ocena_vozaca(p_vozac_id)`
Vraća prosečnu ocenu vozača (NUMERIC, 2 decimale).

### 5. `broj_ocena_vozaca(p_vozac_id)`
Vraća broj ocena vozača (INTEGER).

---

## 🎨 UI/UX PATTERNS

### Server vs Client Components

**Server Components:**
- Sve `page.tsx` fajlovi
- Inicijalno učitavanje podataka
- SEO optimizacija

**Client Components:**
- Interaktivni elementi (forme, dugmad)
- Real-time subscriptions
- State management
- `'use client'` direktiva na vrhu

### Primer Paterna:

```typescript
// app/vozac/page.tsx (Server Component)
export default async function Page() {
  const initialData = await fetchData()
  
  return <DashboardContent initialData={initialData} />
}

// components/vozac/dashboard-content.tsx (Client Component)
'use client'

export function DashboardContent({ initialData }) {
  const [data, setData] = useState(initialData)
  
  useEffect(() => {
    // Realtime subscription
    const channel = supabase.channel(...)
  }, [])
  
  return <div>...</div>
}
```

---

## 🛠️ UTILITY FUNKCIJE

### `formatVreme(vreme: string): string`
Formatira vreme u format `HH:MMh`

```typescript
// Input: "14:30:00" ili "14:30"
// Output: "14:30h"
```

Lokacija: `lib/utils.ts`

Koristi se u:
- Svim prikazima vremena polaska
- Tour cards
- Detalji tura

---

## 🔔 SISTEM NOTIFIKACIJA

### Tipovi Notifikacija:

1. **`odobreno`** - Admin odobrio vozača
2. **`odbijeno`** - Admin odbio vozača
3. **`nova_ocena`** - Poslodavac ocenio vozača
4. **`uplata_potrebna`** - Vozač završio turu, mora da plati

### Automatsko Kreiranje:

Notifikacije se kreiraju automatski preko **database trigger-a**:

```sql
CREATE TRIGGER trigger_notifikuj_vozaca_o_prijavi
  AFTER UPDATE ON public.prijave
  FOR EACH ROW
  EXECUTE FUNCTION notifikuj_vozaca_o_statusu_prijave();

CREATE TRIGGER trigger_notifikuj_ocenu
  AFTER INSERT ON public.ocene
  FOR EACH ROW
  EXECUTE FUNCTION notifikuj_vozaca_o_oceni();
```

### Prikazivanje:

- Bell ikona u navbaru (🔔) sa badge-om
- Automatsko označavanje kao pročitano kada vozač otvori stranicu
- Real-time ažuriranje broja nepročitanih

---

## 📊 SISTEM OCENJIVANJA

### Flow:

1. Poslodavac završi turu (status: `zavrsena`)
2. Na stranici ture vidi dugme **"Oceni vozača"**
3. Otvara dialog sa 5 zvezdi i poljem za komentar
4. Klikne "Oceni"
5. Trigger automatski šalje notifikaciju vozaču
6. Ocena se prikazuje na profilu vozača
7. Prosečna ocena se izračunava i prikazuje

### Ograničenja:

- Jedan poslodavac = jedna ocena po turi
- Samo završene ture mogu biti ocenjene
- Vozač ne može sam sebe da oceni
- Poslodavac može da izmeni svoju ocenu

---

## 💳 PAYMENT INTEGRATION

### 2Checkout

**Webhook URL:** `/api/webhook/2checkout/route.ts`

**Flow:**
1. Vozač završi turu → kreira se uplata (status: `u_toku`)
2. Vozač se blokira
3. Sistem generiše 2Checkout checkout link
4. Vozač plaća
5. 2Checkout šalje webhook na našu API
6. Webhook handler:
   - Pronalazi uplatu po `customer_email`
   - Ažurira status na `placeno`
   - Deblokira vozača

**Testiranje:**
- Test mode u `TEST_MODE_GUIDE.md`

---

## 🐛 ČESTE GREŠKE I REŠENJA

### 1. Hydration Error: `<div>` cannot be descendant of `<p>`

**Problem:** `CardDescription` renderuje `<p>` tag.

**Rešenje:**
```typescript
// ❌ NE:
<CardDescription>
  <div>...</div>
</CardDescription>

// ✅ DA:
<div className="text-sm text-muted-foreground">
  <div>...</div>
</div>
```

### 2. Realtime Ne Radi

**Provera:**
1. Da li je tabela dodata u publication?
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE public.ime_tabele;
   ```
2. Da li je RLS omogućen?
3. Da li korisnik ima permisiju da čita?

### 3. RLS Policy Greška

**Problem:** `new row violates row-level security policy` ili `Error: {}`

**Rešenje za Ocene:**
Ako ne možeš da oceniš vozača, RLS policy je možda pogrešna. Pokreni:
```bash
supabase-fix-ocene-rls.sql
```

**Provera:**
1. Da li postoji `WITH CHECK` policy za INSERT?
2. Da li je `auth.uid()` ispravno prosleđen?
3. Da li je tabela omogućena za RLS?
4. Da li policy koristi ispravne nazive kolona (ne `ocene.kolona` već samo `kolona`)?

### 4. TypeScript Errors

**Provera:**
1. Da li je `database.types.ts` ažuriran?
2. Da li su interfejsi usklađeni sa SQL schema?

---

## 📝 KAKO DODATI NOVU FUNKCIONALNOST

### Korak 1: SQL Schema
```sql
-- Dodaj novu tabelu/kolonu
ALTER TABLE public.ture ADD COLUMN nova_kolona TEXT;
```

### Korak 2: RLS Politike
```sql
CREATE POLICY "policy_name"
  ON public.tabela
  FOR SELECT
  TO authenticated
  USING (true);
```

### Korak 3: TypeScript Tipovi
```typescript
// types/database.types.ts
export interface NoviInterface {
  // ...
}
```

### Korak 4: Komponente
```typescript
// Kreiraj ili ažuriraj komponentu
```

### Korak 5: Realtime (ako treba)
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.nova_tabela;
```

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre Deployment:

- [ ] Sve SQL skripte pokrenute u produkcijskoj Supabase bazi
- [ ] Environment variables postavljene
- [ ] RLS politike testirane
- [ ] Realtime omogućen za sve potrebne tabele
- [ ] 2Checkout production credentials
- [ ] Email notifikacije konfigurisane (opciono)

### Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXT_PUBLIC_2CHECKOUT_MERCHANT_CODE=your-merchant-code
NEXT_PUBLIC_2CHECKOUT_SECRET_KEY=your-secret-key
```

---

## 📚 KLJUČNI FAJLOVI ZA RAZUMEVANJE

### 1. Autentifikacija
- `lib/auth-helpers.server.ts` - Server-side auth
- `lib/auth-helpers.client.ts` - Client-side auth
- `lib/supabase/server.ts` - Server Supabase client
- `lib/supabase/client.ts` - Client Supabase client

### 2. Navbar i Navigacija
- `components/dashboard/navbar.tsx` - Glavni navbar
  - Prikazuje različite linkove po ulozi
  - Bell ikona sa notifikacijama za vozače
  - Dropdown meni

### 3. Dashboard Komponente

**Vozač:**
- `components/vozac/dashboard-content.tsx` - Glavni dashboard
  - Tab "Objave" - Sve dostupne ture
  - Sortiranje i filtriranje
  - Real-time ažuriranje
- `components/vozac/moje-prijave-content.tsx` - Moje prijave
  - 4 taba: Na čekanju, Odobrene, Odbijene, Završene
- `components/vozac/notifikacije-content.tsx` - Notifikacije
  - Real-time indicator
  - Automatsko označavanje kao pročitano

**Poslodavac:**
- `components/poslodavac/dashboard-content.tsx` - Dashboard
  - Statistike
  - Tab navigacija: Aktivne, Na čekanju, Dodeljene, Završene
- `components/poslodavac/feed-content.tsx` - Objave feed
  - Sve odobrene ture na platformi
  - Sortiranje i filtriranje

### 4. Forme
- `app/poslodavac/objavi-turu/page.tsx` - Forma za novu turu
  - Sva polja
  - Validacija
  - Faktura opcije

### 5. Detalji Tura
- `app/vozac/ture/[id]/page.tsx` - Vozač vidi turu
- `app/poslodavac/ture/[id]/page.tsx` - Poslodavac vidi turu
  - Dugme za ocenjivanje (ako završena)
  - Prikaz prijava (ako njegova tura)

---

## 🔍 DEBUGGING TIPS

### 1. Provera Supabase Query-ja

```typescript
const { data, error } = await supabase.from('ture').select('*')

if (error) {
  console.error('Supabase error:', error)
  // Proveri:
  // - RLS politike
  // - Da li je korisnik autentifikovan
  // - Da li kolone postoje
}
```

### 2. Provera Realtime Subscription

```typescript
useEffect(() => {
  const channel = supabase
    .channel('debug-channel')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'ture' },
      (payload) => {
        console.log('Realtime event:', payload) // Proveri da li dolazi
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status) // Treba biti 'SUBSCRIBED'
    })
    
  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

### 3. Provera RLS Politika

```sql
-- U Supabase SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'ime_tabele';
```

### 4. Provera Auth Stanja

```typescript
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)
```

---

## 📦 DEPENDENCIES

### Main:
```json
{
  "next": "15.5.6",
  "react": "^18.3.1",
  "@supabase/ssr": "latest",
  "@supabase/supabase-js": "^2.x",
  "tailwindcss": "^3.x",
  "lucide-react": "latest",
  "class-variance-authority": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest"
}
```

### Instalacija:
```bash
npm install
npm run dev
```

---

## 🎯 NEXT STEPS (Preporuke)

### Kratkoročno:
1. Email notifikacije za vozače
2. SMS notifikacije za hitne slučajeve
3. Export statistika u PDF/Excel
4. Više detalja o vozačima (dokumenti, slike kamiona)

### Dugoročno:
1. Mobilna aplikacija (React Native)
2. GPS tracking tura u realnom vremenu
3. Chat između poslodavca i vozača
4. Automatsko plaćanje (direct debit)
5. Multi-language support
6. Advanced analytics dashboard

---

## 🆘 QUICK REFERENCE

### Kreiranje Nove Ture:
```typescript
const { data, error } = await supabase
  .from('ture')
  .insert({
    firma_id: userId,
    polazak: 'Beograd',
    destinacija: 'Zagreb',
    datum: '2025-12-01',
    vreme_polaska: '10:30',
    opis_robe: 'Paleta',
    ponudjena_cena: 500,
    faktura: 'da',
    status: 'na_cekanju'
  })
```

### Prijava Vozača:
```typescript
const { data, error } = await supabase
  .from('prijave')
  .insert({
    tura_id: turaId,
    vozac_id: userId
  })
```

### Odobravanje Vozača (Admin):
```typescript
// 1. Ažuriraj prijavu
await supabase
  .from('prijave')
  .update({ status: 'odobreno' })
  .eq('id', prijavaId)

// 2. Ažuriraj turu
await supabase
  .from('ture')
  .update({ 
    status: 'dodeljena',
    dodeljeni_vozac_id: vozacId
  })
  .eq('id', turaId)

// 3. Odbij ostale prijave
await supabase
  .from('prijave')
  .update({ status: 'odbijeno' })
  .eq('tura_id', turaId)
  .neq('id', prijavaId)
```

### Završavanje Ture:
```typescript
// 1. Ažuriraj turu
await supabase
  .from('ture')
  .update({ status: 'zavrsena' })
  .eq('id', turaId)

// 2. Ažuriraj prijavu
await supabase
  .from('prijave')
  .update({ status: 'zavrseno' })
  .eq('tura_id', turaId)
  .eq('vozac_id', vozacId)

// 3. Kreiraj uplatu
await supabase
  .from('uplate')
  .insert({
    vozac_id: vozacId,
    tura_id: turaId,
    iznos: 15,
    status: 'u_toku'
  })

// 4. Blokiraj vozača
await supabase
  .from('users')
  .update({ 
    blokiran: true,
    razlog_blokiranja: '...'
  })
  .eq('id', vozacId)
```

### Ocenjivanje Vozača:
```typescript
await supabase
  .from('ocene')
  .insert({
    tura_id: turaId,
    vozac_id: vozacId,
    poslodavac_id: poslodavacId,
    ocena: 5,
    komentar: 'Odličan vozač!'
  })
```

---

## ✅ SQL SKRIPTE KOJE MORAJU BITI POKRENUTE

**KRITIČNO - Poredak je bitan!**

1. `POKRENI-OVO-U-SUPABASE.sql` - Osnovne tabele i funkcije
2. `supabase-enable-realtime.sql` - Realtime za ture i prijave
3. `supabase-add-faktura-field.sql` - Faktura kolona
4. `supabase-add-notifikacije.sql` - Notifikacije tabela
5. `supabase-ukloni-ogranicenje-aktivna-tura.sql` - Dozvoli više tura
6. `supabase-automatska-provera-blokade.sql` - Auto-blokiranje
7. `supabase-dodaj-status-zavrseno.sql` - Završavanje tura
8. `supabase-dodaj-ocene.sql` - Sistem ocenjivanja

---

## 📞 KONTAKT & SUPPORT

Za pitanja kontaktiraj:
- Original Developer: [Tvoj Contact]
- Project Repository: [GitHub/GitLab Link]
- Supabase Project: [Project URL]

---

## 🎓 LEARNING RESOURCES

### Next.js:
- https://nextjs.org/docs
- https://nextjs.org/docs/app/building-your-application/routing

### Supabase:
- https://supabase.com/docs
- https://supabase.com/docs/guides/auth
- https://supabase.com/docs/guides/realtime

### Row Level Security:
- https://supabase.com/docs/guides/auth/row-level-security

### Shadcn UI:
- https://ui.shadcn.com/

---

## 🔥 FINAL NOTES

Ovaj projekat koristi:
- **App Router** (ne Pages Router)
- **Server Components** kao default
- **Client Components** samo kada je neophodno
- **Row Level Security** za sve tabele
- **Real-time subscriptions** za live updates
- **TypeScript** za type safety

**Najvažnije:**
1. Uvek testiraš RLS politike
2. Ne mešaš Server i Client komponente bez razloga
3. Koristiš `getUserWithProfile()` za autentifikaciju
4. Pokreneš sve SQL skripte u pravom redosledu
5. Proveriš da li je Realtime omogućen

---

**SREĆNO KODIRANJE!** 🚀

_Ova dokumentacija pokriva 100% trenutnog stanja projekta._
_Poslednje ažuriranje: 14. Novembar 2025_

