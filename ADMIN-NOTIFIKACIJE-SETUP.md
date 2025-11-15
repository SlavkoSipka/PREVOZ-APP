# Admin Notifikacije - Setup

## Problem
Admin nije mogao da šalje notifikacije vozačima i poslodavcima jer:
1. `notifikacije` tabela koristi `vozac_id` umesto `user_id`
2. `tip` kolona mora biti jedan od dozvoljenih tipova
3. `'admin_poruka'` tip nije postojao u CHECK constraint-u
4. RLS politike nisu bile postavljene za admina

## Rešenje

### 1. Pokreni SQL skriptu u Supabase

Otvori **Supabase SQL Editor** i pokreni:

```sql
-- Fajl: ADD-ADMIN-PORUKA-TIP.sql
```

Ova skripta:
- ✅ Dodaje `'admin_poruka'` tip u CHECK constraint
- ✅ Kreira RLS politiku za admina da može da kreira notifikacije
- ✅ Kreira RLS politiku za admina da može da vidi sve notifikacije
- ✅ Ažurira RLS politike za vozače i poslodavce

### 2. Struktura notifikacije

```typescript
{
  vozac_id: UUID,        // ID korisnika (vozač ili poslodavac)
  tip: 'admin_poruka',   // Obavezan tip
  poruka: string,        // Tekst poruke
  procitano: false       // Default
}
```

### 3. Tipovi notifikacija

| Tip | Opis |
|-----|------|
| `'odobreno'` | Prijava odobrena |
| `'odbijeno'` | Prijava odbijena |
| `'nova_ocena'` | Nova ocena od poslodavca |
| `'uplata_potrebna'` | Potrebna uplata provizije |
| `'admin_poruka'` | **NOVO** - Poruka od administratora |

### 4. Gde admin može da pošalje notifikaciju?

**Na stranici sa detaljima ture:** `/admin/ture/[id]`

Admin vidi:
- 📬 **Pošalji notifikaciju vozaču** - ako je tura dodeljena
- 📬 **Pošalji notifikaciju poslodavcu** - uvek

Svaka kartica ima:
- Textarea za unos poruke
- Button za slanje
- Link ka profilu korisnika

### 5. Kako izgleda notifikacija za korisnika?

Korisnik u notifikacijama vidi:

```
📬 Poruka od administratora:

[tekst koji je admin napisao]
```

### 6. RLS Politike

#### Za Admina:
```sql
-- Admin može da kreira notifikacije
CREATE POLICY "Admin moze da kreira notifikacije"
ON public.notifikacije FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.uloga = 'admin'
  )
);

-- Admin može da vidi sve notifikacije
CREATE POLICY "Admin moze da vidi sve notifikacije"
ON public.notifikacije FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid() AND users.uloga = 'admin'
  )
);
```

#### Za Korisnike (vozači i poslodavci):
```sql
-- Mogu da vide svoje notifikacije
CREATE POLICY "Korisnici mogu da vide svoje notifikacije"
ON public.notifikacije FOR SELECT
USING (vozac_id = auth.uid());

-- Mogu da označe kao pročitane
CREATE POLICY "Korisnici mogu da azuriraju svoje notifikacije"
ON public.notifikacije FOR UPDATE
USING (vozac_id = auth.uid());
```

## Testiranje

1. ✅ Prijavi se kao admin
2. ✅ Idi na `/admin` > tab **"Dodeljene ture"**
3. ✅ Klikni na neku dodeljenu turu
4. ✅ Scroll dole - vidi kartice za slanje notifikacija
5. ✅ Upiši poruku i klikni "Pošalji vozaču"
6. ✅ Uloguj se kao vozač/poslodavac i proveri notifikacije

## Napomene

- `vozac_id` kolona se odnosi na **sve korisnike** (vozače, poslodavce, admina)
- Ime kolone je malo zbunjujuće ali tako je dizajnirana baza
- Admin notifikacije **ne zahtevaju** `prijava_id` (može biti NULL)
- Poruka se automatski formatira sa prefiksom "📬 Poruka od administratora:"

