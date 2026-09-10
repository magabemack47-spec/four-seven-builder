# FOUR x SEVEN — App & Game Builder

Turn HTML websites and HTML games into Android APK files.

Live site: https://four-seven-builder.vercel.app

Created by **SELLO**

## What it does

- Write HTML, CSS, and JavaScript in the browser
- Upload an HTML file or a ZIP project
- Preview the project live
- Save and load projects in the browser
- Build a debug Android APK with GitHub Actions
- Download the APK ZIP and install it on a phone

## How to use

1. Open the live site
2. Write your HTML or upload an HTML/ZIP file
3. Give the project a name
4. Click **BUILD APK**
5. Wait for GitHub Actions to finish
6. Download the ZIP
7. Open the ZIP and install the `.apk` inside

On Android you must allow installs from that app/browser.

## Limits

- Maximum upload size: **3.5 MB**
- A build usually takes **3 to 8 minutes**
- The APK is a **debug** build, not a Play Store release
- HTML/ZIP files are stored briefly in the `jobs/` folder during a build

## Project files

- `index.html` — builder website
- `api/` — Vercel API for health, build, status, and download
- `.github/workflows/build-apk.yml` — Cordova Android build
- `jobs/` — temporary upload folder

## Setup

The live site needs these Vercel environment variables:

- `GITHUB_TOKEN`
- `GITHUB_OWNER`
- `GITHUB_REPO`

After changing files or env vars, redeploy on Vercel.

## License

MIT License. See `LICENSE`.