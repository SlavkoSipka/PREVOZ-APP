# Automatsko blokiranje vozača

## Problem
Vozači koji su odobreni za turu ali je ne izveze (ne označe kao završenu nakon što prođe vreme polaska) trebaju automatski biti blokirani.

## Rešenje

### 1. SQL Funkcije

#### `proveri_i_blokiraj_vozaca(vozac_id, tura_id)`
- Proverava jednu specifičnu turu
- Ako je vreme polaska + 1 sat prošlo i tura nije završena → blokira vozača
- Kreira notifikaciju o blokiranju

#### `proveri_sve_odobrene_ture_vozaca(vozac_id)`
- **NOVA FUNKCIJA** - Proverava SVE odobrene ture vozača
- Poziva `proveri_i_blokiraj_vozaca` za svaku odobrenu turu
- Vraća informaciju da li je vozač blokiran i koliko tura je propustio

### 2. Automatsko pokretanje

Funkcija `proveri_sve_odobrene_ture_vozaca` se poziva automatski:

**Kada:**
- Svaki put kada vozač učita svoj dashboard (`app/vozac/page.tsx`)

**Kako:**
```typescript
await supabase.rpc('proveri_sve_odobrene_ture_vozaca', {
  p_vozac_id: userData.user.id
})
```

### 3. Logika blokiranja

```
1. Vozač ima odobrenu turu za 14.11.2025 u 17:13h
2. Trenutno vreme je 14.11.2025 18:14h (prošao 1 sat od polaska)
3. Tura još uvek ima status 'dodeljena' (nije završena)
4. ✅ VOZAČ SE AUTOMATSKI BLOKIRA
```

### 4. Kada se proverava?

- ✅ Kada vozač učita dashboard
- ✅ Kada vozač pokuša da se prijavi na novu turu (postojeća funkcionalnost)

### 5. Primeri

#### Scenario 1: Vozač propustio turu
```
Odobrena tura: Beograd → Zagreb, 14.11.2025, 17:13h
Trenutno vreme: 14.11.2025 18:14h
Status ture: 'dodeljena'

→ Vozač se BLOKIRA
→ Razlog: "⚠️ Automatski blokiran - niste izvezli odobrenu turu..."
→ Notifikacija se šalje vozaču
```

#### Scenario 2: Vozač označio turu kao završenu
```
Odobrena tura: Beograd → Zagreb, 14.11.2025, 17:13h
Trenutno vreme: 14.11.2025 18:14h
Status ture: 'zavrsena' ✓

→ Vozač se NE blokira
→ Sve je OK!
```

#### Scenario 3: Vreme još nije prošlo
```
Odobrena tura: Beograd → Zagreb, 14.11.2025, 17:13h
Trenutno vreme: 14.11.2025 17:30h (manje od 1 sat)
Status ture: 'dodeljena'

→ Vozač se NE blokira (još ima vremena)
```

### 6. Grace Period (Period tolerancije)

**1 sat** od vremena polaska ture

- Vozač ima 1 sat POSLE planiranog vremena polaska da označi turu kao završenu
- Ako ne označi u tom periodu → automatsko blokiranje

### 7. Setup

#### Korak 1: Pokrenite SQL
U Supabase SQL Editor pokrenite:
```sql
-- OPCIJA 1: Pokrenite ceo POKRENI-OVO-U-SUPABASE.sql
-- (uključuje sve nove funkcije)

-- OPCIJA 2: Pokrenite samo novu funkciju
-- Pokrenite supabase-automatska-provera-blokade.sql
```

#### Korak 2: Deploy Next.js aplikaciju
```bash
# Frontend već ima kod za pozivanje funkcije
# Samo deploy-ujte promene
```

### 8. Testiranje

1. **Kreiraj turu** sa vremenom polaska npr. 17:13h
2. **Admin odobri vozača** za tu turu
3. **Sačekaj da prođe vreme polaska + 1 sat** (npr. 18:14h)
4. **Vozač otvori dashboard** → Automatski se blokira! ✅
5. **Proveri:**
   - Polje `blokiran` u `users` tabeli = `true`
   - Polje `razlog_blokiranja` ima informacije o turi
   - Nova notifikacija u `notifikacije` tabeli

### 9. Kako deblokirati vozača?

Vozač se deblokira nakon što:
1. Plati proviziju za propuštenu turu
2. Admin ručno deblo kira nalog

### 10. Važne napomene

- ⚠️ **Grace period:** Vozač ima 1 sat od vremena polaska
- ⚠️ **Samo odobrene ture:** Proveravaju se samo ture sa statusom `odobreno`
- ⚠️ **Samo nedovršene ture:** Proveravaju se samo ture sa statusom `aktivna` ili `dodeljena`
- ✅ **Notifikacije:** Vozač dobija notifikaciju o blokiranju
- ✅ **Real-time:** Provera se vrši svaki put kada vozač učita dashboard

### 11. Pitanja i odgovori

**Q: Šta ako vozač ne otvori dashboard?**
A: Biće blokiran čim otvori dashboard ili pokuša da se prijavi na novu turu.

**Q: Može li vozač da ima više odobrenih tura?**
A: Da, funkcija proverava SVE odobrene ture odjednom.

**Q: Šta ako vozač propusti 2 ture?**
A: Biće blokiran, a razlog blokiranja će sadržati informacije o prvoj propuštenoj turi.

**Q: Kako promeniti grace period?**
A: U funkciji `proveri_i_blokiraj_vozaca`, promenite `+ INTERVAL '1 hour'` na željeni interval (npr. `+ INTERVAL '30 minutes'`).

**Q: Da li se provera vrši automatski u pozadini?**
A: Ne, provera se vrši kada vozač interaktuje sa platformom (otvara dashboard ili se prijavljuje na turu).

