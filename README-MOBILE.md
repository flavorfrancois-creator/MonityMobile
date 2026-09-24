# Monity World - Application Mobile

## Description
Application mobile Expo (Android & iOS) pour Monity World - Plateforme de paiement digital avec support NFC et codes-barres.

## Fonctionnalités

### Authentification
- Connexion par téléphone ou email
- Inscription avec vérification OTP
- Double authentification (2FA)
- Récupération de mot de passe

### Portefeuilles
- Multi-devises (USD, EUR, CDF, XAF, XOF)
- Consultation des soldes
- Transferts d'argent
- Recharge et retrait

### Cartes Virtuelles
- Création de cartes virtuelles
- Gestion des cartes NFC
- Blocage/déblocage
- Historique des transactions

### Scan NFC
- Lecture des cartes NFC Monity
- Identification par NFC
- Paiement par NFC

### Scan Code-barres
- Scanner les cartes Monity via caméra
- Identification par code-barres
- Transactions via code-barres

### Autres
- QR Code de paiement
- Historique des transactions
- Profil utilisateur
- Paramètres de sécurité

## Configuration

### Prérequis
- Node.js 18+
- Expo CLI
- Android Studio (pour Android)
- Xcode (pour iOS, macOS uniquement)

### Installation

```bash
# Installer les dépendances
yarn install

# Démarrer l'application
npx expo start
```

### Variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
EXPO_PUBLIC_API_URL=https://www.monityworld.link
```

## Build

### Android
```bash
# Build APK de développement
eas build -p android --profile development

# Build APK de production
eas build -p android --profile production
```

### iOS
```bash
# Build pour simulateur
eas build -p ios --profile development

# Build pour App Store
eas build -p ios --profile production
```

## Structure du projet

```
app/
├── (auth)/           # Écrans d'authentification
│   ├── login.tsx
│   ├── register.tsx
│   ├── verify-otp.tsx
│   └── forgot-password.tsx
├── (tabs)/           # Navigation principale
│   ├── index.tsx     # Dashboard
│   ├── wallet.tsx    # Portefeuilles
│   ├── scan.tsx      # Menu de scan
│   ├── cards.tsx     # Cartes virtuelles
│   └── profile.tsx   # Profil
├── nfc-scan.tsx      # Scanner NFC
├── barcode-scan.tsx  # Scanner code-barres
├── send.tsx          # Envoyer de l'argent
├── history.tsx       # Historique
├── qr.tsx            # QR Code
├── recharge.tsx      # Recharger
└── receive.tsx       # Recevoir

src/
├── context/
│   └── AuthContext.tsx
└── services/
    └── api.ts
```

## API Backend

L'application se connecte au backend Monity World via :
- URL: `https://www.monityworld.link/api`

## Permissions requises

### Android
- `NFC` - Lecture des cartes NFC
- `CAMERA` - Scanner les codes-barres
- `VIBRATE` - Retour haptique
- `USE_BIOMETRIC` - Authentification biométrique

### iOS
- `NFCReaderUsageDescription` - Lecture NFC
- `NSCameraUsageDescription` - Caméra
- `NSFaceIDUsageDescription` - Face ID

## Support

Pour toute question ou problème :
- Email: support@monityworld.link
- Site: https://www.monityworld.link

## Licence

© 2025 Monity World. Tous droits réservés.
