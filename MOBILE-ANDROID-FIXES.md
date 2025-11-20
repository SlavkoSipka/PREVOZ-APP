# 📱 Mobile Android Chrome - Bug Fixes

**Datum:** 20. novembar 2024  
**Problem:** Session se gubi nakon refresh-a, push notifikacije ne rade, Google login nestabilan na Android Chrome.

---

## ✅ **ŠTA JE URAĐENO**

### 1. **Cookie Handling za Mobile** 🍪

**Problem:**
- Cookies se nisu čuvali na Android Chrome
- Session se gubio nakon refresh-a ili zatvaranja tab-a
- Default `SameSite=Strict` ne radi dobro na mobile

**Rešenje:**
- ✅ Produžen `MaxAge` na **7 dana** za mobile (umesto 1 sat)
- ✅ `SameSite=Lax` umesto `Strict` (bolja kompatibilnost sa mobile)
- ✅ Auto-detection mobile device-a
- ✅ Explicit `Secure` flag samo za HTTPS
- ✅ Logging za debugging

**Fajlovi:**
- `lib/supabase/client.ts` - Browser client sa mobile-optimized cookies
- `middleware.ts` - Server middleware sa boljim cookie handling-om

---

### 2. **Session Persistence** 💾

**Problem:**
- Session se gubio nakon navigacije ili refresh-a
- `autoRefreshToken` nije bio eksplicitno setovan
- localStorage nije bio eksplicitno podešen

**Rešenje:**
- ✅ `persistSession: true` - Čuva session u localStorage
- ✅ `autoRefreshToken: true` - Auto-refresh kada token istekne
- ✅ `detectSessionInUrl: true` - Detektuje session iz URL-a (za OAuth callback)
- ✅ `flowType: 'pkce'` - Sigurniji OAuth flow
- ✅ Explicit localStorage storage

**Fajl:**
- `lib/supabase/client.ts`

---

### 3. **Push Notifications - Auto Re-Subscribe** 🔔

**Problem:**
- User dozvoli notifikacije (browser permission = "granted")
- Ali subscription se NE SAČUVA u bazi
- Prikaže se: "Baza: Subscription ne postoji (treba da se kreira)"
- User mora RUČNO ponovo da klikne "Omogući"

**Rešenje:**
- ✅ **Auto re-subscribe** - Ako user ima `permission === 'granted'` ali nema DB subscription, automatski se pozove `subscribe()`
- ✅ Provera se dešava pri svakom mount-u banner-a
- ✅ Koristi `maybeSingle()` da ne baca error ako subscription ne postoji

**Fajl:**
- `components/push-notifications/enable-notifications-banner.tsx`

```typescript
// Auto re-subscribe ako user ima permission ali nema DB subscription
useEffect(() => {
  const autoResubscribe = async () => {
    if (!isSupported || !userId || permission !== 'granted') return
    
    const supabase = createClient()
    const { data: dbSub } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle()
    
    if (!dbSub) {
      console.log('🔄 Auto re-subscribing... (permission granted but no DB sub)')
      await subscribe()
    }
  }
  
  autoResubscribe()
}, [isSupported, permission, userId])
```

---

### 4. **Google Login - Mobile Optimizations** 🔐

**Problem:**
- Google login nestabilan na Android Chrome
- Ponekad izbaci "code verifier" error
- Popup prozor se ne otvara kako treba

**Rešenje:**
- ✅ Mobile detection
- ✅ `display: 'touch'` za Android (Google OAuth parametar za mobile)
- ✅ Bolje logging-ovanje za debugging
- ✅ PKCE flow eksplicitno setovan

**Fajl:**
- `lib/auth-helpers.client.ts`

---

## 🧪 **KAKO TESTIRATI**

### **Test 1: Session Persistence**
1. Otvori **prevezime.rs** u Android Chrome
2. Login sa Google
3. **Zatvori tab** ili app
4. Otvori ponovo **prevezime.rs**
5. ✅ Trebao bi da ostaneš ulogovan

### **Test 2: Push Notifications**
1. Login
2. Klikni "Omogući notifikacije"
3. Dozvoli u browser-u
4. ✅ Banner automatski prikazuje: "Notifikacije su omogućene ✓"
5. Klikni "Proveri Push Status"
6. ✅ Trebalo bi: 
   - `Browser subscription: Postoji ✓`
   - `Baza: Subscription postoji ✓`

### **Test 3: Google Login**
1. Logout
2. Klikni "Prijavi se sa Google"
3. Izaberi nalog
4. ✅ Trebao bi da te vrati nazad i uloguje

### **Test 4: Refresh Stabilnost**
1. Uloguj se
2. Idi na `/vozac` ili `/poslodavac`
3. **Refresh** (povuci prstom nadole)
4. ✅ Ne bi trebao da te vrati na login

---

## 🔍 **DEBUGGING**

### **Chrome DevTools Console**
Otvori console (na desktop-u ili Remote Debug za Android):
```javascript
// Proveri cookies
console.log(document.cookie)

// Proveri localStorage
console.log(localStorage)

// Proveri session
const supabase = createClient()
const { data } = await supabase.auth.getSession()
console.log('Session:', data.session)
```

### **Očekivani Output (Kada Je OK)**
```
🍪 Cookie set: sb-xxx-auth-token | MaxAge: 604800 | Mobile: true
✅ Middleware: Session active for user 12345678
📱 Google login initiated from: Mobile
🔄 Auto re-subscribing... (permission granted but no DB sub)
✅ Successfully subscribed to push notifications
```

---

## 📝 **IZMENJENI FAJLOVI**

1. `lib/supabase/client.ts` - Mobile cookie handling + session persistence
2. `middleware.ts` - Server cookie options + session logging
3. `components/push-notifications/enable-notifications-banner.tsx` - Auto re-subscribe
4. `lib/auth-helpers.client.ts` - Google login mobile optimization

---

## ⚠️ **NAPOMENE**

### **Third-Party Cookies**
Ako Android Chrome blokira third-party cookies:
1. Otvori Chrome Settings
2. Site Settings → Cookies
3. Omogući "Allow all cookies"

### **Service Worker**
Service Worker se može resetovati ako:
- User očisti cache
- Browser Update
- App je neaktivan duže vreme

**Rešenje:** Auto re-subscribe će to automatski srediti.

---

## 🚀 **DEPLOYMENT**

Nakon push-a na Git:
1. Netlify će automatski build-ovati
2. Idi na **prevezime.rs** (NE deploy preview URL)
3. Testiraj sve gore navedeno

**Ne zaboravi:**
- ✅ `NEXT_PUBLIC_SITE_URL=https://prevezime.rs` u Netlify env
- ✅ Google OAuth redirect URI: `https://prevezime.rs/auth/callback`
- ✅ Supabase Site URL: `https://prevezime.rs`

---

✅ **SVE JE READY ZA TEST!** 🎉

