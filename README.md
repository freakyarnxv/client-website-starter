# Client Website Starter

A reusable, responsive marketing website starter built with Astro, TypeScript, and Tailwind CSS 4. The starter is intentionally content-first and ships little client-side JavaScript.

## Before using this for a client

1. Update the business name, copy, services, contact details, and social links in `src/pages/index.astro`, `src/components/SiteHeader.astro`, and `src/components/SiteFooter.astro`.
2. Set the deployed domain in `astro.config.mjs` and `public/robots.txt`. Astro uses `site` to create canonical URLs and the sitemap.
3. Replace the example title, description, and social image in the page frontmatter. Add a real social preview image at `public/social-card.svg` or update its path.
4. Add the client's approved images, privacy notice, analytics, and form provider as needed. Keep credentials in local environment variables or the hosting provider, never in source control.
5. Review keyboard navigation, page content, image alternatives, and all links before launch.

## Local setup

Dependencies are declared in `package.json` but are not installed yet. After approving dependency installation, use your chosen package manager to install them, then run:

```sh
npm run dev
```

Other scripts:

```sh
npm run check
npm run build
npm run preview
```

## Project structure

```text
public/                 Static files served as-is
src/components/         Reusable site sections and UI
src/layouts/            Shared page shell and metadata
src/pages/              File-based routes
src/styles/             Tailwind entry point and design tokens
```

Create each client site as its own repository from this starter. Keep brand-specific content and assets in that project; promote improvements back into the starter deliberately.
