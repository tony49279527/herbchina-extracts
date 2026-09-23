# HerbChina Extracts — Official Website

Static multi-page company website for **HerbChina Extracts** (founded 2019,
Xi'an, China), supplier of botanical and mushroom extracts for overseas buyers.

## Structure

- `index.html` — Home: hero, trust bar, product categories, qualifications, applications
- `products.html` — Spec tables per category (botanical / mushroom), Request COA/Quote
- `quality.html` — Quality approach, 5-step process, batch documentation
- `faq.html` — Buyer FAQ (MOQ, lead time, packaging, testing, customization) + FAQ schema
- `resources.html` — Knowledge hub
- `coa-guide.html` — Article: how to read a botanical extract COA
- `fruiting-body-vs-mycelium.html` — Article: fruiting body vs mycelium buyer's guide
- `about.html` — Company story, principles
- `contact.html` — Contact card + inquiry form (prepares message text; buyer sends via WeChat/call — no backend, no WhatsApp)
- `sitemap.xml` / `robots.txt` — SEO
- `styles.css` — shared design system (Fraunces + Inter via Google Fonts)
- `main.js` — mobile nav, scroll-reveal animations, inquiry form handler
- `images/` — AI-generated illustrative photography (real photos pending from owner)

No build step, no dependencies. Any static host works. On Vercel: import this
repo, no build command, output directory is the repo root.

## Content policy

Only confirmed facts are published here: company name, founded 2019, Xi'an base,
phone/WeChat `+86 135 7292 7148`. WhatsApp is NOT offered (unconfirmed).
Do not add product specifications, certifications, client cases, or factory
claims without the owner's confirmation.
