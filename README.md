# Scholarship Application Portal

A public web application for the **Shrimati Ramadevi Omprakash Kejriwal Family
Private Trust** scholarship, letting students anywhere in India apply online,
and giving the Trust an admin dashboard to review, approve, or reject
applications.

- **Public site**: landing page (`/`) and application form (`/apply`), open
  to anyone, no login required.
- **Admin dashboard**: `/admin`, protected by login. Lists applications,
  supports search/status filters, and lets the Trust review each application
  (including uploaded documents) and update its status.

Built with Next.js (App Router) + TypeScript + Tailwind CSS, and
[Supabase](https://supabase.com) for the database, file storage, and admin
authentication.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com), sign up, and create a new
   project (the free tier is enough to start).
2. In the Supabase dashboard, open **SQL Editor → New query**, paste the
   contents of [`supabase/schema.sql`](supabase/schema.sql), and run it. This
   creates the `applications` table and a private `documents` storage bucket.
3. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key
   - **service_role** key (keep this secret — never expose it in client code)

## 2. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in the three values from
step 1:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 3. Create an admin login

The admin dashboard uses Supabase Auth (email + password). Create the
Trust's admin account in **Authentication → Users → Add user** in the
Supabase dashboard (use "Auto Confirm User" so it doesn't need an email
click). Add one user per person who should be able to review applications.

## 4. Run locally

```bash
npm install
npm run dev
```

- Public site: [http://localhost:3000](http://localhost:3000)
- Apply: [http://localhost:3000/apply](http://localhost:3000/apply)
- Admin: [http://localhost:3000/admin](http://localhost:3000/admin) (redirects
  to login if not signed in)

## 5. Deploy

The easiest option is [Vercel](https://vercel.com/new): import this
repository, add the same three environment variables from step 2 in the
Vercel project settings, and deploy. Any host that runs Next.js works too.

## How it works

- **Applying** (`src/app/apply`): a public form posts to a Server Action
  (`actions.ts`) which validates input with `zod`
  ([`src/lib/validation.ts`](src/lib/validation.ts)), uploads the Aadhaar
  card and marksheets to the private `documents` Supabase Storage bucket,
  and inserts a row into the `applications` table using the Supabase
  **service role** key (the only place that key is used).
- **Reviewing** (`src/app/admin`): protected by `src/proxy.ts`, which checks
  for a logged-in Supabase session on every `/admin/*` request. The
  dashboard and detail pages read applications using the signed-in admin's
  own session — Row Level Security (in `supabase/schema.sql`) only allows
  `authenticated` users to read or update the `applications` table and the
  `documents` bucket, so uploaded documents are never public; the admin
  detail page generates short-lived signed URLs to view them.

## Notes for the Trust

- Eligibility (95%+ marks) and the "decision within 7 days" note shown on
  the form match the original paper/Google Forms application. Update the
  copy in [`src/app/apply/page.tsx`](src/app/apply/page.tsx) and
  [`src/app/page.tsx`](src/app/page.tsx) if the criteria change.
- Uploaded documents are capped at 10MB each (PDF/JPG/PNG) — adjustable via
  `MAX_FILE_BYTES` in `src/lib/fileSniff.ts`.
- Application statuses are `pending → under_review → approved / rejected`,
  editable per-application from the admin detail page along with internal
  notes.
