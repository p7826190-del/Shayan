# Site Audit Report: AL Kareem Quran Institute

This audit documents the discovery findings and root causes of the SEO indexability and renderability issues on the live website.

## 1. Stack & Framework Discovery
- **Framework**: Single Page Application (SPA) built using React 19, Vite 8, and Supabase client-side integration.
- **Client Routing**: No router library is used. Navigation is managed via client-side state (`currentPage`) rendering the landing page or portal dashboards, and hashes (`#courses`, `#fees`, etc.) for homepage navigation.
- **Hosting Artifact Structure**: Production build creates a single `dist/index.html` file (0.55 kB) containing a blank container `<div id="root"></div>` and scripts.

---

## 2. Raw HTML vs. Rendered DOM Diff
A comparison between the raw HTML returned from the server (curl/crawler with no JavaScript) and browser-rendered output confirms the indexability issue.

| Metric / Content | Raw Server Response (No JS) | Browser Rendered Output (With JS) | Status |
| :--- | :--- | :--- | :--- |
| **Visible Text** | None (0 words) | Full Landing Page Content | 🔴 Crawlers see a blank page |
| **Headings** | None | `<h1>`, `<h2>`, `<h3>` sections | 🔴 Missing for search engines |
| **Page Title** | `<title>al-kareem-quran-institute</title>` | Same | 🔴 Unprofessional slug title |
| **Meta Description**| None | None | 🔴 Missing SEO Snippet |
| **Images Alt Text** | None | Missing on multiple items | 🔴 Poor accessibility/SEO |
| **Interactive Links**| None | WhatsApp Chat, Registration buttons | 🔴 Crawlers cannot traverse pages |

### Root Cause
Because the site is a client-side rendered (CSR) React SPA, crawlers that do not execute JavaScript (or index HTML before JS execution) retrieve a completely blank page. Furthermore, if any initialization scripts fail (such as missing env credentials), even browsers see a blank screen.

---

## 3. Crawl & Page Directory
The site operates as a single-page marketing website with client-side portal components.
- **Public URL Sections**:
  - `/` (Home, courses, pricing, about, contact, and FAQ are sections on the homepage)
- **Private/Dynamic Portals**:
  - `/auth` (Student/Teacher Sign-in and registration)
  - `/dashboard` (Role-specific dashboards for Student, Teacher, and Admin)

---

## 4. Basic SEO & Accessibility Analysis
- **Metadata**: No Open Graph (`og:*`) or Twitter Card meta tags for social media previews. No schema markup (JSON-LD) for structured educational courses.
- **Sitemap & Robots**: The site lacks a `sitemap.xml` and `robots.txt` file, meaning search engines have no direction or priority when crawling the site.
- **Image Formats**: Multiple inline icons and layout assets lack optimization (`alt` text, width/height definitions, modern WebP formats).

---

## 5. Recommended Optimization Plan
We recommend:
1. **Adding Vite SSR Pre-rendering**: Pre-renders the public landing page to static HTML in `dist/index.html` during build. Real search engine crawlers and users will load the complete HTML immediately, while React hydrates the interactive elements.
2. **Metadata & Title Improvements**: Replace the raw title slug with a keyword-optimized Title and Meta Description. Add OG and Twitter tags.
3. **Structured Data**: Add JSON-LD schemas for `EducationalOrganization` and `Course`.
4. **Sitemap & Robots**: Provide `sitemap.xml` and `robots.txt`.
5. **Porting Environment Variables**: Create a proper `.env` file to ensure the application compiles and renders correctly without console initialization warnings.
