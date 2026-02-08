Place required local assets here for 100% offline operation:

- fonts/
  - NotoSansArabic-Regular.woff2
  - NotoSansArabic-Bold.woff2 (optional)
  - Amiri-Regular.woff2
- arabesque.png  (background pattern used by UI)

Steps:
1. Download the fonts from Google Fonts (Noto Sans Arabic and Amiri) and place converted `.woff2` files into this folder.
2. Add `arabesque.png` (or other pattern) into this folder.
3. Build with `npm run build` so Vite bundles the app and serves these files from `/assets` in the production bundle.

PWA icons:
- icons/icon-192.png
- icons/icon-512.png

Place icon files at `public/assets/icons/`.
These are required for the web manifest (`/manifest.webmanifest`) so the app can be installed to home screens and packaged by wrappers like webintoapp.
