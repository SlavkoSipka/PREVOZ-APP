# 🔒 Manuelno Blokiranje Korisnika - Admin

## 📋 Pregled

Admin može **ručno** blokiratii deblokirati korisnike (vozače) kroz admin dashboard.

**VAŽNO**: SVA automatska logika blokiranja je **UKLONJENA**!

---

## ✨ Kako Radi?

### 1. **Admin Blokira Vozača**

```
1. Admin ide na Admin Dashboard
         ↓
2. Klikne na "Korisnici" tab
         ↓
3. Pronađe vozača
         ↓
4. Klikne na profil vozača
         ↓
5. Vidi "Blokiraj korisnika" sekciju
         ↓
6. Unese razlog blokiranja
         ↓
7. Klikne "Blokiraj"
         ↓
8. Sistem postavlja:
   - blokiran = true
   - razlog_blokiranja = "Admin uneo razlog..."
   - vreme_automatske_blokade = NOW()
```

### 2. **Vozač Pokušava Da Se Prijavi (dok je blokiran)**

```
1. Vozač klikne "Prihvati turu"
         ↓
2. Provera: Da li je blokiran?
         ↓
   DA → Greška: "Nalog je blokiran. Razlog: ..."
         Dugme je disabled (ne može kliknuti)
         ↓
   NE → Prijava se šalje
```

### 3. **Admin Deblokira Vozača**

```
1. Admin ide na profil vozača
         ↓
2. Vidi da je vozač blokiran
         ↓
3. Klikne "Deblokiraj korisnika"
         ↓
4. Sistem postavlja:
   - blokiran = false
   - razlog_blokiranja = null
   - vreme_automatske_blokade = null
         ↓
5. Vozač može ponovo da se prijavljuje na ture! 🎉
```

---

## 🗄️ SQL Setup

### Potrebni SQL Fajlovi

1. **`UKLONI-AUTOMATSKO-BLOKIRANJE.sql`** ⭐
   - Briše sve automatske funkcije
   - Briše triggere
   - Briše pg_cron job-ove

2. **`FIX-ADMIN-UPDATE-BLOKIRAN.sql`** ⭐
   - Dodaje RLS politike za admina
   - Dozvoljava adminu da menja `blokiran` status

3. **`POKRENI-OVO-U-SUPABASE-CLEAN.sql`** ✅
   - Čist SQL bez automatskog blokiranja
   - Samo kolone i indexi

---

## 🚀 Kako Pokrenuti?

### **Korak 1: Ukloni automatsko blokiranje**

```sql
-- U Supabase SQL Editor pokreni:
\i UKLONI-AUTOMATSKO-BLOKIRANJE.sql
```

### **Korak 2: Proveri Admin RLS politike**

```sql
-- U Supabase SQL Editor pokreni:
\i FIX-ADMIN-UPDATE-BLOKIRAN.sql
```

### **Korak 3: Ukloni frontend poziv**

Frontend više NE poziva `proveri_sve_odobrene_ture_vozaca()` u `app/vozac/page.tsx` ✅

---

## 📂 Kolone Koje Ostaju

| Tabela | Kolona | Tip | Namena |
|--------|--------|-----|--------|
| `users` | `blokiran` | boolean | Da li je korisnik blokiran |
| `users` | `razlog_blokiranja` | text | Razlog blokiranja (admin unosi) |
| `users` | `vreme_automatske_blokade` | timestamp | Vreme kada je blokiran |

**Napomena**: Iako se zove `vreme_automatske_blokade`, ova kolona se sada koristi i za manuelno blokiranje!

---

## 🎯 Admin UI

Admin može da blokira/deblokira kroz:

### 1. **Admin Dashboard** (`app/admin/korisnici/[id]/page.tsx`)
- Dugme "Blokiraj korisnika"
- Polje za razlog blokiranja
- Dugme "Deblokiraj korisnika"

### 2. **Korisnici Tab**
- Lista svih korisnika
- Filter za blokirane korisnike
- Brz pristup profilima

---

## ✅ Checklist

- [x] Obrisane sve automatske funkcije
- [x] Obrisani triggeri
- [x] Uklonjen pg_cron job
- [x] Uklonjen frontend poziv automatske funkcije
- [x] Zadržane kolone za manuelno blokiranje
- [x] Admin može da blokira/deblokira kroz UI
- [x] Vozači NE mogu da se prijavljuju dok su blokirani
- [x] RLS politike omogućavaju adminu da menja `blokiran` status

---

## 🎉 Rezultat

**Admin ima punu kontrolu!**

- ✅ Admin blokira vozača **kada želi**
- ✅ Admin unosi **svoj razlog** blokiranja
- ✅ Admin deblokira vozača **kada odluči**
- ❌ **NEMA** automatskog blokiranja
- ❌ **NEMA** cron job-ova
- ❌ **NEMA** trigera koji automatski blokiraju

**Vozači:**
- ❌ **NE MOGU** da se prijavljuju dok su blokirani
- ✅ **VIDE** razlog blokiranja
- ✅ **MOGU** da gledaju ture

---

## 📝 Napomene

- Kolona `razlog_blokiranja` može sadržati bilo kakav tekst koji admin unese
- Admin može ostaviti `razlog_blokiranja` praznim (null)
- Vozač vidi razlog blokiranja u svom profilu i na dashboard-u
- Admin može promeniti razlog blokiranja bilo kada (samo UPDATE)

---

## 🔧 Troubleshooting

### Ako admin NE MOŽE da promeni `blokiran` status:

1. Proveri RLS politike:
```sql
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'users' AND cmd = 'UPDATE';
```

2. Pokreni ponovo:
```sql
\i FIX-ADMIN-UPDATE-BLOKIRAN.sql
```

### Ako još uvek postoje automatske funkcije:

```sql
-- Proveri koje funkcije postoje:
SELECT proname FROM pg_proc WHERE proname LIKE '%blok%';

-- Ako vidiš automatske funkcije, pokreni ponovo:
\i UKLONI-AUTOMATSKO-BLOKIRANJE.sql
```

---

## 🚀 Gotovo!

Sada imaš sistem gde **samo admin** kontroliše blokiranje:

1. ✅ Admin blokira ručno
2. ✅ Admin deblokira ručno
3. ✅ Vozači NE mogu da se prijavljuju dok su blokirani
4. ❌ NEMA automatskog blokiranja

**Sve je pod tvojom kontrolom! 🎉**

