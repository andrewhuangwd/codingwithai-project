# Andies

Care for the versions of yourself you want to grow.

Andies is a life-dimension avatar tracker. You create Andies — one per area of life you want to care for — give each one Needs (habits), and earn HP and badges by completing them.

## Stack

- **Next.js 16** — frontend and routing
- **Convex** — database, queries, mutations, and server actions
- **Anthropic Claude** (Haiku) — AI onboarding diagnostic and recommendations
- **TypeScript, Zod, date-fns, Vitest**

---

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_CONVEX_URL=https://<your-slug>.convex.cloud
CONVEX_DEPLOYMENT=dev:<your-slug>
```

### 3. Start Convex (first time)

```bash
npx convex dev
```

Follow the prompts to create a Convex project. This generates `convex/_generated/` and keeps your schema in sync. Leave it running in a terminal.

### 4. Add `ANTHROPIC_API_KEY` to Convex

Convex actions read environment variables from the Convex dashboard, not from `.env.local`.

Go to your Convex dashboard → **Settings** → **Environment Variables** and add:

```
ANTHROPIC_API_KEY = sk-ant-...
```

### 5. Start the dev server

In a second terminal:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Run tests

```bash
npm test
```

---

## Deployment

### Step 1 — Push to GitHub

```bash
git add -A
git commit -m "Andies MVP"
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

### Step 2 — Deploy Convex to production

```bash
npx convex deploy
```

This outputs your production deployment URL and name. Copy them — you need them for Vercel.

Then add `ANTHROPIC_API_KEY` to your **production** Convex deployment:

```
Convex dashboard → your project → (switch to Production) → Settings → Environment Variables
```

### Step 3 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your GitHub repo.
2. Framework preset: **Next.js** (auto-detected).
3. Under **Environment Variables**, add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_CONVEX_URL` | `https://<your-slug>.convex.cloud` (production URL) |
| `CONVEX_DEPLOYMENT` | `prod:<your-slug>` |
| `ANTHROPIC_API_KEY` | your key (optional — Convex reads this, not Vercel; add here only if you want it as a backup) |

4. Click **Deploy**.

Vercel runs `npm run build` automatically. The build does not require `ANTHROPIC_API_KEY` — it is only read at runtime inside Convex actions.

---

## Project layout

```
app/           Next.js routes and global CSS
components/    React UI components
convex/        Database schema, queries, mutations, AI actions
lib/           Pure TypeScript logic (HP, dates, badges, types)
tests/         Vitest unit tests for lib/
```

## Notes

- `convex/_generated/api.ts` is a stub. Running `npx convex dev` replaces it with fully typed generated code.
- The AI onboarding flow degrades gracefully — if `ANTHROPIC_API_KEY` is missing, it returns sensible fallback Andies.
- Sprites are colored placeholder divs. Real pixel-art sprite generation is planned for V2.
