# Pregnancy Tracker

Pregnancy Tracker is a lightweight React + TypeScript app that keeps the most common prenatal details in one calm dashboard. Set your estimated due date, log quick mood and symptom check-ins, keep provider appointments tidy, and note prenatal supplements. LocalStorage keeps things private offline, while optional Supabase sync lets you keep data across devices once you sign in.

## What it does

- **Due date overview** – Save an estimated due date with an optional note so you always have a quick reference for where you are in the pregnancy timeline.
- **Weekly baby size** – See a fruit-and-veggie comparison for the current gestational week, automatically calculated from your due date.
- **Mood & symptom log** – Capture day-to-day feelings, symptoms, or milestones, then edit entries when plans change.
- **Appointment organizer** – Track upcoming visits, who they are with, and reminders or prep notes.
- **Supplement tracking** – Record prenatal vitamins, iron, or other add-ons with contextual details.
- **Offline-ready data** – Runs entirely in the browser with local persistence, making it private and reliable even without network access.

## Why it helps

Having these touchpoints together makes it easier to spot patterns (for example, how you’re feeling around specific appointments), remember questions for care providers, and keep a lightweight record you can share if you choose to. Because the app does not require an account or connectivity, it’s ideal for people who want a low-friction, personal tracker that still feels intentional.

## Run it locally

```bash
npm install
npm run dev
```

Then open the printed URL (defaults to `http://localhost:5173`) in your browser.

## Tech stack

- [React](https://react.dev) with hooks for stateful UI
- [TypeScript](https://www.typescriptlang.org/) for strong typing
- [Vite](https://vitejs.dev) for a fast dev/build toolchain
- [Supabase](https://supabase.com) for authentication + hosted storage (JSON snapshot per user)

Use this as-is or as a foundation for a fuller prenatal companion app.

## Supabase setup

1. Create a Supabase project and retrieve the `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` for your instance.
2. Create the `pregnancy_snapshots` table and policies:

   ```sql
   create extension if not exists "uuid-ossp";

   create table if not exists pregnancy_snapshots (
     user_id uuid primary key references auth.users on delete cascade,
     data jsonb not null,
     updated_at timestamptz not null default now()
   );

   alter table pregnancy_snapshots enable row level security;

   create policy "user can read own snapshot"
     on pregnancy_snapshots
     for select
     using (auth.uid() = user_id);

   create policy "user can insert own snapshot"
     on pregnancy_snapshots
     for insert
     with check (auth.uid() = user_id);

   create policy "user can update own snapshot"
     on pregnancy_snapshots
     for update
     using (auth.uid() = user_id)
     with check (auth.uid() = user_id);
   ```

3. Copy `.env.example` to `.env.local` (or `.env`) at the project root and drop in your Supabase credentials:

   ```bash
   cp .env.example .env.local
   # edit with your actual values
   ```

4. Restart `npm run dev`. Sign up/in from the new auth screen and your tracker state will be saved in Supabase (one JSON blob per user). You can still run without Supabase and rely on localStorage if you skip the env vars.
