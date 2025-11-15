# Fix - Naslovi notifikacija

## Problem

Kada admin pošalje notifikaciju, naslov je prikazivao **"Prijava odbijena"** umesto **"📬 Poruka od administratora"**.

## Uzrok

Frontend kod je generisao naslove na osnovu `tip` polja, ali je podrazumevao samo 2 tipa:
- `'odobreno'` → "Prijava odobrena"
- **SVE OSTALO** → "Prijava odbijena" ❌

To znači da su **SVE** notifikacije osim `'odobreno'` prikazivale "Prijava odbijena".

## Rešenje

Ažurirao sam **SVE** stranice sa notifikacijama da korektno prikazuju naslove za **SVE** tipove:

### Tipovi notifikacija i njihovi naslovi:

| Tip | Naslov | Ikonica |
|-----|--------|---------|
| `'odobreno'` | Prijava odobrena | ✅ CheckCircle (zelena) |
| `'odbijeno'` | Prijava odbijena | ❌ XCircle (narandžasta) |
| `'nova_ocena'` | Nova ocena | 🔔 Bell (žuta) |
| `'uplata_potrebna'` | Uplata provizije | 🔔 Bell (crvena) |
| **`'admin_poruka'`** | **📬 Poruka od administratora** | **📧 Mail (plava)** |

## Ažurirani fajlovi:

### 1. `components/vozac/notifikacije-content.tsx`
- ✅ Dodao logiku za sve tipove
- ✅ Dodao `Mail` ikonicu za admin poruke
- ✅ Različite boje za svaki tip

### 2. `app/poslodavac/notifikacije/page.tsx`
- ✅ Ispravio `user_id` → `vozac_id`
- ✅ Dodao generisanje naslova na osnovu `tip` polja
- ✅ Uklonio referencu na nepostojećo `naslov` polje

### 3. `app/firma/notifikacije/page.tsx`
- ✅ Ispravio `user_id` → `vozac_id`
- ✅ Dodao generisanje naslova na osnovu `tip` polja
- ✅ Uklonio referencu na nepostojećo `naslov` polje

## Kako izgleda admin notifikacija?

**Za vozača/poslodavca:**

```
┌─────────────────────────────────────────┐
│ 📧 📬 Poruka od administratora           │
├─────────────────────────────────────────┤
│ 📬 Poruka od administratora:             │
│                                          │
│ [tekst koji je admin napisao]           │
├─────────────────────────────────────────┤
│ 15.11.2025. 14:30                        │
└─────────────────────────────────────────┘
```

**Boja:** Plava (`bg-blue-100 text-blue-600`)  
**Ikonica:** Mail (📧)

## Testiranje

1. ✅ Pokreni SQL skriptu `ADD-ADMIN-PORUKA-TIP.sql` (ako još nisi)
2. ✅ Prijavi se kao admin
3. ✅ Pošalji notifikaciju vozaču ili poslodavcu
4. ✅ Uloguj se kao vozač/poslodavac
5. ✅ Idi na notifikacije
6. ✅ Proveri da piše **"📬 Poruka od administratora"** ✅

## Napomene

- ❌ **Greška pre:** Sve notifikacije osim 'odobreno' su prikazivale "Prijava odbijena"
- ✅ **Sada:** Svaka notifikacija ima svoj specifični naslov i ikonicu
- 🎨 **Vizuelno:** Svaki tip ima svoju boju i ikonicu za lakše raspoznavanje
- 📧 **Admin poruke:** Plava boja + Mail ikonica

## Dodane funkcionalnosti

- 🎨 **Različite boje** za svaki tip notifikacije
- 📧 **Mail ikonica** za admin poruke (umesto Bell)
- ✅ **Korektni naslovi** za sve tipove
- 🔧 **Ispravljen bug** sa `user_id` vs `vozac_id`

---

**ZAVRŠENO!** Sada sve notifikacije prikazuju korektne naslove! 🎉

