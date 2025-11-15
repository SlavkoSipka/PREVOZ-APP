# Uklanjanje ograničenja - Više aktivnih tura za vozače

## Šta je promenjeno?

Vozači sada mogu da se prijavljuju za **više tura istovremeno**, čak i ako već imaju jednu ili više dodeljenih/aktivnih tura.

## Kako primeniti izmenu?

### Opcija 1: Pokrenite samo novu SQL skriptu (brže)

Otvorite Supabase SQL Editor i pokrenite:

```sql
-- Sadržaj iz: supabase-ukloni-ogranicenje-aktivna-tura.sql
```

Ili kopirajte i pokrenite ceo fajl `supabase-ukloni-ogranicenje-aktivna-tura.sql`

### Opcija 2: Pokrenite celokupnu skriptu (ako već niste)

Pokrenite ceo `POKRENI-OVO-U-SUPABASE.sql` fajl (ažuriran sa izmenom)

## Šta je uklonjeno?

### STARA verzija funkcije (SA ograničenjem):

```sql
-- Proveri da li već ima aktivnu/dodeljenu turu
SELECT EXISTS(
  SELECT 1 FROM prijave p
  JOIN ture t ON p.tura_id = t.id
  WHERE p.vozac_id = p_vozac_id
    AND p.status = 'odobreno'
    AND t.status IN ('dodeljena', 'aktivna')
) INTO v_ima_aktivnu_turu;

IF v_ima_aktivnu_turu THEN
  RETURN jsonb_build_object(
    'moze', false,
    'razlog', 'Već imate aktivnu turu. Možete se prijaviti za novu nakon završetka trenutne ture.',
    'tip', 'aktivna_tura'
  );
END IF;
```

### NOVA verzija (BEZ ograničenja):

```sql
-- UKLONJENO: Provera da li već ima aktivnu/dodeljenu turu
-- Vozač sada može da se prijavljuje za više tura istovremeno
```

## Preostala ograničenja

Vozači i dalje **NE MOGU**:

1. ❌ Da se prijave za turu ako je njihov **nalog blokiran**
2. ❌ Da se **ponovo prijave** za turu na koju su već odbijeni
3. ❌ Da se **dvaput prijave** za istu turu

Vozači **MOGU**:

1. ✅ Da se prijave za **više tura istovremeno**
2. ✅ Da imaju **više aktivnih dodeljenih tura** u isto vreme
3. ✅ Da se prijavljuju za nove ture dok čekaju odobrenje za druge
4. ✅ Da upravljaju sa **više istovremenih transporta**

## Kako to funkcioniše?

### Primer toka:

1. **Vozač se prijavi za Turu A** → Status: "Čeka odobrenje"
2. **Vozač se prijavi za Turu B** → Status: "Čeka odobrenje" ✅ (sada dozvoljeno!)
3. **Admin odobri Turu A** → Status: "Odobreno"
4. **Vozač se prijavi za Turu C** → Status: "Čeka odobrenje" ✅ (i dalje može!)
5. **Admin odobri Turu B** → Status: "Odobreno"
6. **Vozač sada ima 2 aktivne ture istovremeno** ✅

### Vozač dashboard:

- **"Moje prijave" → "Na čekanju"**: Sve prijave koje čekaju odobrenje
- **"Moje prijave" → "Odobrene"**: Sve odobrene ture (može ih biti više)
- **"Moje prijave" → "Završene"**: Sve izvezene ture

## Benefiti za platformu:

- 🚚 **Veća efikasnost** - Vozači mogu da prihvate više poslova
- 💰 **Veći prihod** - Više tura = više provizije
- ⏱️ **Bolja iskorišćenost** - Vozači nisu blokirani čekajući završetak jedne ture
- 📈 **Fleksibilnost** - Vozači mogu da planiraju više tura u različite periode

## Testiranje:

1. Prijavite se kao vozač
2. Pronađite turu i prijavite se → "Čeka odobrenje"
3. Pronađite drugu turu i prijavite se → **Trebalo bi da uspe!** ✅
4. Neka admin odobri prvu turu → Status: "Odobreno"
5. Pronađite treću turu i prijavite se → **I dalje bi trebalo da uspe!** ✅

## Pitanja i odgovori:

**Q: Šta ako vozač ima previše aktivnih tura?**
A: To nije tehnički ograničeno. Vozač može da ima koliko god želi. Admin može da odbije prijavu ako smatra da vozač ima previše obaveza.

**Q: Da li vozač može da odbije dodeljenu turu?**
A: Trenutno ne postoji ta funkcionalnost, ali vozač može da kontaktira admina.

**Q: Šta se dešava kada vozač završi turu?**
A: Nalog se blokira dok ne plati proviziju. Ali može da nastavi sa drugim aktivnim turama nakon plaćanja.

**Q: Da li vozač može da se prijavi za ture sa preklapajućim datumima?**
A: Da, sistem to dozvoljava. Vozač je odgovoran za upravljanje svojim rasporedom.

