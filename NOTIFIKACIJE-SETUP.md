# Postavljanje sistema notifikacija

## Pregled

Sistem notifikacija omogućava vozačima da automatski dobiju obaveštenja kada admin odobri ili odbije njihovu prijavu za turu.

## Koraci za postavljanje

### 1. Kreirajte tabelu za notifikacije

Pokrenite SQL skripta `supabase-add-notifikacije.sql` u Supabase SQL Editor-u:

```sql
-- Kreiranje tabele za notifikacije
CREATE TABLE IF NOT EXISTS public.notifikacije (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vozac_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  prijava_id UUID REFERENCES public.prijave(id) ON DELETE CASCADE,
  tip TEXT NOT NULL CHECK (tip IN ('odobreno', 'odbijeno')),
  poruka TEXT NOT NULL,
  procitano BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Omogućite Row Level Security (RLS)

SQL skripta automatski postavlja RLS politike:

- **Vozači mogu da vide samo svoje notifikacije** - Vozači mogu da SELECT-uju samo notifikacije gde je `vozac_id` jednak njihovom ID-ju
- **Vozači mogu da ažuriraju svoje notifikacije** - Vozači mogu da UPDATE-uju svoje notifikacije (npr. da ih označe kao pročitane)
- **Admini mogu da kreiraju notifikacije** - Samo admini mogu da INSERT-uju nove notifikacije

### 3. Omogućite Real-time za notifikacije

SQL skripta automatski omogućava real-time za tabelu:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifikacije;
```

## Kako funkcioniše

### Kada admin odobri ili odbije vozača

1. **Odobravanje vozača:**
   - Admin odobri prijavu
   - Sistem kreira notifikaciju za odabranog vozača
   - Sistem kreira notifikacije za sve odbijene vozače (sa razlogom: "Odabran je drugi vozač")

2. **Odbijanje vozača:**
   - Admin odbije prijavu sa obrazloženjem
   - Sistem kreira notifikaciju za odbijenog vozača sa razlogom odbijanja

### Za vozače

- Vozači vide badge sa brojem nepročitanih notifikacija u navbaru (crveni krug)
- Notifikacije se automatski ažuriraju u realnom vremenu
- Vozači mogu:
  - Pogledati sve notifikacije
  - Označiti pojedinačnu notifikaciju kao pročitanu
  - Označiti sve notifikacije kao pročitane
  - Obrisati pojedinačnu notifikaciju
  - Kliknuti na notifikaciju da vide detalje ture

## Boje i ikone notifikacija

- **Odobreno:** Zelena pozadina, CheckCircle ikona
- **Odbijeno:** Narančasta pozadina (ne crvena!), XCircle ikona
- **Nepročitane:** Plavi border sa leve strane kartice

## Stranice

- `/vozac/notifikacije` - Lista svih notifikacija za vozača
- Navbar prikazuje badge sa brojem nepročitanih notifikacija

## Komponente

- `components/vozac/notifikacije-content.tsx` - Prikazuje listu notifikacija sa real-time ažuriranjima
- `components/admin/approve-driver-button.tsx` - Admin dugme za odobravanje/odbijanje koje automatski kreira notifikacije
- `components/dashboard/navbar.tsx` - Ažuriran da prikazuje badge za notifikacije

## Testiranje

1. Prijavite se kao vozač i prijavite se na neku turu
2. Prijavite se kao admin i odobrite ili odbijte vozača
3. Vratite se na vozač nalog - trebalo bi da vidite notifikaciju bez potrebe za osvežavanjem stranice
4. Broj nepročitanih notifikacija trebalo bi da se pojavi u navbaru

## Napomene

- Sistem koristi Supabase Realtime za trenutne ažuriranja
- Notifikacije se automatski brišu kada se obriše vozač (CASCADE)
- Notifikacije se mogu ručno obrisati od strane vozača

