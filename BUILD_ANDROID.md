Steps to produce an offline Android APK using Capacitor

Prerequisites:
- Node.js and npm installed
- Android Studio installed (for final APK signing)

1. Install npm deps

```bash
npm install
```

2. Add Capacitor and required plugins

```bash
npm install @capacitor/core @capacitor/cli
npx cap init madrassa-app com.example.madrassa
```

3. Build the web app (production)

```bash
npm run build
```

4. Copy web assets into Capacitor native project

```bash
npx cap add android
npx cap copy android
```

5. Open Android Studio, then Build > Generate Signed Bundle / APK

Notes for offline:
- Ensure `public/assets` contains fonts and images as indicated in `public/assets/README.md`.
- Avoid runtime network calls. We removed AI dependency and external importmap; everything is bundled at build time.
- Optional: add plugins for file access if you need to export reports to device storage.
