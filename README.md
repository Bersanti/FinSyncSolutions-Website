# FinSync Solutions — Website

A modern multi-page static website for **FinSync Solutions** (black background, white text, blue accents).  
Built as a lightweight lead generator + information hub.

## Pages
- `/` — Home
- `/services/` — Services
- `/pricing/` — Pricing
- `/purpose/` — Purpose
- `/about/` — About

## Features included
- Sticky header with CTA button
- Desktop nav + mobile hamburger menu
- Back-to-top button
- Lead/contact forms (multiple locations)
  - Fields: name, email, phone, company, notes
  - Email is required; others optional
  - Friendly validation + error states
  - Loading spinner + success state
  - Honeypot spam trap
- SEO fundamentals
  - Unique title + meta description per page
  - OpenGraph + Twitter card tags
  - JSON-LD schema markup
  - `sitemap.xml` + `robots.txt`
- Fully responsive layout (mobile → desktop)

## Local development
You can run this site with any static server. Two easy options:

### Option A: Python
```bash
cd finsyncsolutions-site
python3 -m http.server 5500
```
Then open: `http://localhost:5500`

### Option B: Node
```bash
cd finsyncsolutions-site
npx serve
```

> Note: opening the HTML files directly with `file://` is not recommended.

## Formspree setup (to email curtis@finsyncsolutions.org)
This project is wired to Formspree via JavaScript.  
Until you configure Formspree, the form will fall back to opening a **mailto** draft.

1. Create an account at Formspree.
2. Create a new form and set the recipient to: `curtis@finsyncsolutions.org`
3. Copy your endpoint URL (looks like `https://formspree.io/f/abcdwxyz`)
4. Open **`assets/js/config.js`** and replace:
   ```js
   formspreeEndpoint: "https://formspree.io/f/YOUR_FORM_ID",
   ```
   with your real endpoint.

That’s it — the forms will send leads automatically.

## Deploy
This is a static site, so you can deploy it anywhere:

### GitHub Pages (recommended with your custom domain)
1. Push this repo to GitHub.
2. In GitHub: **Settings → Pages**
3. Set:
   - Source: `Deploy from a branch`
   - Branch: `main` / root
4. Add your custom domain: `finsyncsolutions.org`

### Netlify / Vercel
- Drag-and-drop the folder, or connect the GitHub repo.
- No build command needed (static).

## Branding / assets
- The original provided logo was recolored from green → blue.
- Main assets:
  - `assets/img/mark-blue.png` (icon)
  - `assets/img/logo-blue-dark.png` (full logo, blue mark + white text)
  - `assets/img/logo-blue-light.png` (full logo, blue mark + dark text)
  - `assets/img/og-image.png` (OpenGraph share image)

## Quick edits
- Update navigation labels: edit any HTML page (header section).
- Update copy:
  - Home: `index.html`
  - About: `about/index.html`
  - Services: `services/index.html`
  - Pricing: `pricing/index.html`
  - Purpose: `purpose/index.html`
- Update pricing tiers: `pricing/index.html`
- Update colors/typography: `assets/css/styles.css`
