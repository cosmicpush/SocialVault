# Repository Guidelines

## Project Structure & Module Organization
Next.js App Router code resides in `app/`. Shared UI lives in `components/`, with helper logic in `lib/` (client-side) and `utils/` (server-side). Prisma schema files are in `prisma/`; SQLite data stores live in `database/`. Static assets sit in `public/`, and automation or maintenance flows are scripted in `scripts/`. Adjust auth or background workers only after reviewing `middleware.ts` and `ecosystem.config.js`.

## Build, Test, and Development Commands
- `npm run dev` – local Next.js server with hot reload.
- `npm run setup` – install, generate Prisma client, push schema; run after cloning or schema updates.
- `npm run build` / `npm start` – production build and local serve.
- `npm run lint`, `npm run typecheck` – ESLint (Next core-web-vitals) and TypeScript; run both pre-commit.
- `npm run backup` / `npm run restore` – snapshot or recover the encrypted database; back up before schema work.

## Coding Style & Naming Conventions
Use TypeScript with modern React idioms. Prettier enforces 2-space indentation, single quotes, no semicolons, and ES5 trailing commas—run `npm run format` or enable editor formatting on save. Name React components and files in PascalCase (`components/TagFilter.tsx`); favor kebab- or snake-case for scripts (`scripts/create-user.js`). Keep Tailwind class lists grouped logically. ESLint downgrades unused vars to warnings; document intentional ignores inline.

## Testing Guidelines
No automated test suite exists yet, so lean on linting, type checks, and targeted manual QA. When adding tests, colocate them near features (e.g., `app/accounts/__tests__/…`) and prefer Playwright or Vitest for alignment with Next.js. Smoke-test credential CRUD, tag filtering, TOTP generation, and export flows before any PR.

## Commit & Pull Request Guidelines
History shows short, task-focused commit subjects (`Added replace tags option`); lean toward imperative tense going forward (`Add tag filtering guard`). Keep commits scoped, and include a body when affecting security, schema, or infra. Pull requests must describe changes, link issues, flag schema or env updates, and attach UI screenshots when visuals shift. Call out any follow-up ops steps (`npm run prod:reload`, DB migrations) in the description.

## Security & Configuration Tips
Do not commit `.env` or database files; mirror new variables in `.env.example` and rotate `NEXT_PUBLIC_ENCRYPTION_KEY` through secrets management. Use `npm run check-db` to validate Prisma changes before deployment, and coordinate backups via the PM2 maintenance scripts. Keep `DEV_MODE_BYPASS_AUTH` limited to local debugging and clear it before pushing.
