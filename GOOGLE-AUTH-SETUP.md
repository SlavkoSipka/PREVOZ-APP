# Google OAuth Setup

## **1. Supabase konfiguracija (5 min)**

1. Idi na **Supabase Dashboard** → Tvoj projekat
2. Klikni **Authentication** → **Providers**
3. Nađi **Google** i klikni na njega
4. Uključi **Enable Sign in with Google**
5. **Kopiraj callback URL** (biće nešto kao: `https://xxx.supabase.co/auth/v1/callback`)

## **2. Google Cloud Console**

1. Idi na: https://console.cloud.google.com
2. Kreiraj novi projekat ili izaberi postojeći
3. Idi na **APIs & Services** → **Credentials**
4. Klikni **Create Credentials** → **OAuth 2.0 Client ID**
5. Ako tražri, kreiraj **OAuth consent screen** prvo:
   - User Type: **External**
   - App name: **TransLink**
   - User support email: Tvoj email
   - Developer contact: Tvoj email
   - Dodaj scope: `email`, `profile`
6. Kreiraj **OAuth Client ID**:
   - Application type: **Web application**
   - Name: **TransLink**
   - Authorized redirect URIs: **Nalepi Supabase callback URL**
7. **Kopiraj Client ID i Client Secret**

## **3. Vrati se u Supabase**

1. Nalepi **Client ID** i **Client Secret** iz Googla
2. Klikni **Save**

## **Gotovo! Testiraj:**

### **Prijava:**
1. Idi na `/prijava`
2. Klikni **"Nastavi sa Google"**
3. Loguj se sa Google nalogom

### **Registracija:**
1. Idi na `/registracija`
2. Izaberi **Vozač** ili **Poslodavac**
3. Klikni **"Nastavi sa Google"**
4. Loguj se sa Google nalogom
5. **Automatski** te vodi na **onboarding stranicu** da popuniš profil!

## **Šta se dešava u pozadini:**

- Email/password registracija → Potvrdi email → Onboarding
- **Google OAuth** → Direktno na onboarding (bez potvrde email-a)
- Nakon onboarding-a → Dashboard (vozač ili poslodavac)

