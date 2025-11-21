# 🌐 Netlify Environment Variable Setup

## 📝 **DODAJ OVO U NETLIFY:**

### **1. Idi na Netlify Dashboard**
1. Otvori svoj sajt na Netlify
2. Idi na **Site settings**
3. Klikni **Environment variables** (levo u meniju)

---

### **2. Dodaj Build ID Variable**

**Variable name:**
```
NEXT_PUBLIC_BUILD_ID
```

**Value:**
```
${COMMIT_REF}
```

**Options:**
- ✅ Values → Select: **All deploys**
- ✅ Scopes → Select: **Builds** i **Functions**

**Klikni:** "Add variable"

---

### **3. Redeploy Sajt**

Nakon dodavanja varijable:

```bash
# Lokalno:
git add .
git commit -m "Add version checker for cache-busting"
git push

# Ili u Netlify:
Deploys → Trigger deploy → Deploy site
```

---

## ✅ **PROVERA:**

Nakon deploy-a, otvori Chrome DevTools → Console i vidiš:

```
localStorage.getItem('app_version')
// Trebalo bi nešto kao: "build-1732212000000"
```

---

## 🔧 **ALTERNATIVA (ako gore ne radi):**

Umesto `${COMMIT_REF}`, koristi statičku vrednost:

```
NEXT_PUBLIC_BUILD_ID=v1.0.0
```

I povećavaj ručno nakon svakog deploy-a:
```
v1.0.1
v1.0.2
...
```

---

✅ **Gotovo!**

