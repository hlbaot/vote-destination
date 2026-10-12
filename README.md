# Vote Destination

Next.js App Router project for the public voting website and CMS admin area.

## Scripts

```bash
npm run dev
npm run build:css
npm run lint
npm run build
```

## Structure

- `src/app`: route files, layouts, metadata, and global CSS only.
- `src/app/(user)`: public routes `/`, `/explore`, `/destination/[id]`, `/vote`, and `/guide`.
- `src/app/(admin)`: CMS route `/cms`.
- `src/features/user`: page-level public website features.
- `src/features/admin`: page-level CMS features.
- `src/components/shared`: cross-role UI such as `Icon`, `Toast`, and `AppShell`.
- `src/components/user`: public website layout, destination, map, and vote components.
- `src/components/admin`: CMS-only components.
- `src/context`: shared app context provider.
- `src/data`: destination data, map data, mock data, and legacy-compatible province image data.
- `src/types`: single source for TypeScript domain types, re-exported from `src/types/index.ts`.
- `src/scss`: SCSS partials grouped by `base`, `shared`, `user`, and `admin`.
- `assets-src/destinations`: source destination images that should not be served directly.
- `public/images/destinations`: web-ready `{id}.webp` destination images.
- `public/maps`: public map assets.

## Naming

- Component files use PascalCase.
- Feature and grouping folders use kebab-case.
- Hooks use camelCase and start with `use`.
- Data and utility files use camelCase.
- App code should import project files with the `@/` alias.
