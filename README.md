# Blog Writer

Draft SEO-friendly blog posts. This repo is seeded from the latest Ansiversa mini-app starter baseline.

## Current baseline

- Public landing page on `/`
- Protected app entry on `/app`
- Shared Ansiversa shell, navbar, footer, and auth boundary
- Current `@ansiversa/components` version: `^0.0.169`

## Commands

```bash
npm install
npm run typecheck
npm run build
```

## Notes

- Update `src/app.meta.ts` only if the app registry identity changes.
- Keep middleware, layout, and shared component patterns aligned with `app-starter`.
- Update `AGENTS.md` after every completed task.
