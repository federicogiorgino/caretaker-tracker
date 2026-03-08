# 🏥 Caretaker Tracker

Track your caretaker's exact hours — daily logs with real arrival/departure times, automatic diff against expected schedule, and monthly reports.

**Stack:** Next.js 15 · TypeScript · Tailwind CSS · shadcn/ui · PostgreSQL (Neon) · Drizzle ORM

---

## Local Setup

### 1. Install dependencies
```bash
pnpm install
```

### 2. Create a Neon database
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the **Connection string** from the dashboard (looks like `postgres://user:pass@ep-xxxx.aws.neon.tech/neondb?sslmode=require`)

### 3. Configure environment
```bash
cp .env.local.example .env.local
```
Paste your Neon connection string as `POSTRGES_URL`.

### 4. Push the schema to your database
```bash
pnpm db:push
```
This creates the `shifts` table in Neon. Run this once, or any time you change the schema.

### 5. Run the dev server
```bash
pnpm dev
```

---

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/caretaker-tracker.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Under **Environment Variables**, add:
   - `POSTRGES_URL` → your Neon connection string
   - `TZ` → `Europe/Rome`
4. Click **Deploy**

That's it. Share the Vercel URL with your family.

> **Tip:** In the Neon dashboard you can also connect Neon directly to your Vercel project (Vercel → Storage → Connect Store) and it will set `POSTRGES_URL` automatically.

---

## Useful commands

```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm db:push      # Sync schema to database (safe to re-run)
pnpm db:studio    # Open Drizzle Studio to browse/edit data visually
pnpm db:generate  # Generate SQL migration files
pnpm db:migrate   # Run migrations
```

---

## Customizing the schedule

Edit `lib/constants.ts` to change shifts or expected hours:

```typescript
export const SHIFTS = [
  { id: "morning", label: "Morning", expectedStart: "08:00", expectedEnd: "10:00", expectedMins: 120 },
  { id: "lunch",   label: "Lunch",   expectedStart: "13:00", expectedEnd: "14:00", expectedMins: 60  },
  { id: "evening", label: "Evening", expectedStart: "20:00", expectedEnd: "21:00", expectedMins: 60  },
];
```
