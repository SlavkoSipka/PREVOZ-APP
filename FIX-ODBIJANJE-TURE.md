# FIX: Odbijanje ture od strane admina

## **Problem:**
Kada admin odbije turu sa porukom, tura se ne odbija ispravno - ostaje status "na_cekanju" ili se briše iz baze.

## **Rešenje:**

### **1. SQL Fix - Dodaj 'odbijena' status**
Pokreni: `FIX-STATUS-ODBIJENA.sql`

```sql
ALTER TABLE public.ture
ADD CONSTRAINT ture_status_check
CHECK (status IN ('aktivna', 'na_cekanju', 'dodeljena', 'zavrsena', 'odbijena'));
```

### **2. Admin komponenta - Postavi status umesto brisanja**

**Staro (loše):**
```typescript
await supabase
  .from('ture')
  .delete()  // ❌ Tura se briše iz baze
  .eq('id', selectedTura.id)
```

**Novo (dobro):**
```typescript
await supabase
  .from('ture')
  .update({ 
    status: 'odbijena',  // ✅ Status se menja
    dodatne_napomene: razlog ? `❌ Razlog odbijanja: ${razlog}` : '❌ Tura odbijena'
  })
  .eq('id', selectedTura.id)
```

### **3. TypeScript types - Dodaj novi status**

```typescript
export type StatusTure = 'aktivna' | 'na_cekanju' | 'dodeljena' | 'zavrsena' | 'odbijena'
```

### **4. Poslodavac dashboard - Prikaži odbijene ture**

Dodato:
- Filter za odbijene ture
- Nov tab "Odbijene (X)"
- Prikaz razloga odbijanja u `dodatne_napomene`

---

## **Kako sada radi:**

### **Admin odbija turu:**
```
1. Admin klikne "Odbij turu"
2. Otvara se dialog
3. Admin unese razlog (opciono)
4. Klikne "Odbij"
   ↓
5. UPDATE ture SET 
     status = 'odbijena',
     dodatne_napomene = '❌ Razlog odbijanja: ...'
   WHERE id = X
   ↓
6. Tura ostaje u bazi sa statusom 'odbijena' ✅
```

### **Poslodavac vidi:**
```
Dashboard → Tab "Odbijene (1)" 
   ↓
Kartica sa turom:
   Status: ❌ Odbijena
   Dodatne napomene: "❌ Razlog odbijanja: Nepotpuni podaci"
```

---

## **Statusni flow tura:**

```
         Poslodavac objavi
                │
                ▼
         [na_cekanju] 🟡
         /           \
        /             \
       ▼               ▼
  [aktivna] 🟢    [odbijena] ❌
      │
      ▼
  [dodeljena] 🔵
      │
      ▼
  [zavrsena] ✅
```

---

## **Fajlovi promenjeni:**

1. ✅ `FIX-STATUS-ODBIJENA.sql` - SQL skripta
2. ✅ `components/admin/ture-approval-list.tsx` - Admin odbija turu
3. ✅ `types/database.types.ts` - TypeScript tipovi
4. ✅ `components/poslodavac/dashboard-content.tsx` - Poslodavac vidi odbijene
5. ✅ `app/admin/page.tsx` - Admin vidi status "odbijena"

---

## **Koraci za pokretanje:**

### **KORAK 1: Pokreni SQL**
```bash
# Otvori: Supabase Dashboard → SQL Editor
# Fajl: FIX-STATUS-ODBIJENA.sql
# Klikni: Run
```

### **KORAK 2: Testiraj**
```
1. Admin odbije neku turu sa razlogom
2. Proveri u Supabase:
   SELECT * FROM ture WHERE status = 'odbijena';
   ✅ Trebalo bi da vidiš turu sa statusom 'odbijena'
3. Uloguj se kao poslodavac
4. Idi na Dashboard → Tab "Odbijene"
5. ✅ Trebalo bi da vidiš odbijenu turu sa razlogom
```

---

## **Provera u bazi:**

```sql
-- Proveri status constraint
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name = 'ture_status_check';

-- Trebalo bi:
-- CHECK (status IN ('aktivna', 'na_cekanju', 'dodeljena', 'zavrsena', 'odbijena'))
```

```sql
-- Proveri odbijene ture
SELECT id, polazak, destinacija, status, dodatne_napomene
FROM public.ture
WHERE status = 'odbijena';
```

---

## **✅ GOTOVO!**

Sada admin može da odbije turu sa razlogom i poslodavac će videti zašto je odbijena! 🎉

