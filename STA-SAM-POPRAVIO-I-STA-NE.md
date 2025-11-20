# ⚠️ REVERT - Google Login Popravljen (20.11.2024)

## 🚨 **ŠTA SE DESILO**

Pokušao sam da optimizujem cookies i session za mobile, ali sam preterao i POKVARILO sam Google login.

**Error:** "Session je istekla. Molimo pokušajte ponovo da se prijavite."

---

## ❌ **ŠTA JE BILO LOŠE (I SADA JE UKLONJENO)**

### 1. **`lib/supabase/client.ts`**
**Problem:**
```typescript
auth: {
  flowType: 'pkce',  // ← OVO JE POKVARILO OAuth flow!
  storage: window.localStorage,
  // ... ostalo
}
```

**Zašto je bilo loše:**
- Explicit `flowType: 'pkce'` u browser client config OMETA Supabase default PKCE handling
- Menjanje default storage-a može da pokvari code verifier koji se čuva između OAuth redirect-a
- Menjanje MaxAge cookies ometa session exchange

### 2. **`middleware.ts`**
**Problem:**
```typescript
const cookieOptions = {
  maxAge: options.maxAge ?? 604800, // ← OVO MENJA Supabase defaults!
  sameSite: 'lax' as const,
  // ...
}
```

**Zašto je bilo loše:**
- Forciranje `maxAge: 604800` (7 dana) overriduje Supabase cookie management
- Menja se cookie lifetime tokom OAuth callback procesa
- Supabase MORA sam da kontroliše cookie lifetime za session tokens

---

## ✅ **ŠTA JE SADA URAĐENO (REVERT)**

### 1. **`lib/supabase/client.ts`** ✅
```typescript
// JEDNOSTAVNA verzija - ne diraj auth config!
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) { /* basic */ },
        set(name, value, options) { 
          // Koristi options KAKO JESU - ne menjaj ih!
        },
        remove(name, options) { /* basic */ }
      }
    }
  )
}
```

**Šta je OK:**
- ✅ Basic cookie handling
- ✅ Ne diraš `auth` config
- ✅ Ne menjaj `maxAge`, `sameSite` koji dolaze od Supabase-a
- ✅ Supabase sam upravlja PKCE flow-om

### 2. **`middleware.ts`** ✅
```typescript
// Jednostavna verzija - samo prosleđuj options
set(name, value, options) {
  request.cookies.set({ name, value, ...options })
  response.cookies.set({ name, value, ...options })
}
```

**Šta je OK:**
- ✅ Ne menjaj cookie options
- ✅ Samo prosleđuj šta Supabase pošalje
- ✅ Ne override-uj `maxAge`, `sameSite`, `secure`

### 3. **`lib/auth-helpers.client.ts`** ✅
```typescript
// Uklonio mobile detection i display: 'touch'
queryParams: {
  prompt: 'select_account',
  access_type: 'offline',
  // Nema više display: 'touch' jer to može da ometa desktop login
}
```

---

## 🎯 **ŠTA JE ZADRŽANO (I RADI)**

### ✅ **Push Notifications - Auto Re-Subscribe**

**Fajl:** `components/push-notifications/enable-notifications-banner.tsx`

```typescript
useEffect(() => {
  const autoResubscribe = async () => {
    if (!isSupported || !userId || permission !== 'granted') return
    
    const { data: dbSub } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (!dbSub) {
      console.log('🔄 Auto re-subscribing...')
      await subscribe()
    }
  }
  autoResubscribe()
}, [isSupported, permission, userId])
```

**Zašto OVO radi:**
- ✅ Ne dira cookies
- ✅ Ne dira OAuth flow
- ✅ Samo automatski poziva `subscribe()` ako user ima permission ali nema DB subscription

---

## 🧪 **TEST (Trebalo bi da radi sada)**

### **1. Google Login (Desktop i Mobile)**
```
1. Otvori prevezime.rs
2. Klikni "Prijavi se sa Google"
3. Izaberi nalog

✅ OČEKIVANO: Uspešno se uloguješ
```

### **2. Push Notifications (Mobile)**
```
1. Login
2. Klikni "Omogući notifikacije"
3. Dozvoli u browser-u
4. Sačekaj 1-2 sekunde
5. Klikni "Proveri Push Status"

✅ OČEKIVANO: Auto-subscribe će kreirati DB subscription
```

---

## 📝 **LEKCIJA NAUČENA**

### ❌ **NEMOJ:**
1. ❌ Ne diraj `auth: { flowType, storage, ... }` config u browser client
2. ❌ Ne menjaj `maxAge` ili druge cookie options koje Supabase šalje
3. ❌ Ne force-uj `sameSite`, `secure` - pusti Supabase da sam odluči
4. ❌ Ne dodavaj mobile-specific OAuth params ako nisu neophodni

### ✅ **SLOBODNO MOŽEŠ:**
1. ✅ Basic cookie get/set/remove (ali ne menjaj options)
2. ✅ UI optimizacije (auto re-subscribe, banners, itd.)
3. ✅ Loading states, prefetching, transitions
4. ✅ DB query optimizacije (`maybeSingle()`, itd.)

---

## 🚀 **NAREDNI KORACI**

### **Za Session Persistence (ako bude problem):**
NEMOJ dirati `lib/supabase/client.ts`!

Umesto toga:
1. Proveri da li `NEXT_PUBLIC_SITE_URL` je tačan
2. Proveri Supabase Dashboard → Auth Settings → Session timeout (default 1h)
3. Ako treba duži session, promeni U SUPABASE DASHBOARD, ne u kodu

### **Za Mobile Optimizacije:**
Fokus na:
1. ✅ UI/UX (loading states, smooth transitions)
2. ✅ Push notifications (auto re-subscribe, better error handling)
3. ✅ Caching i prefetching (Next.js level, ne cookie level)

---

✅ **Google Login sada treba da radi normalno na svim device-ima!**

**Test i javi!** 📱💻

