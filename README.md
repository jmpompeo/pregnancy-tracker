# Pregnancy Tracker

Pregnancy Tracker is a lightweight React + TypeScript app that keeps the most common prenatal details in one calm dashboard. Set your estimated due date, log quick mood and symptom check-ins, keep provider appointments tidy, and note prenatal supplements. Everything is stored in localStorage, so your information stays on your device and is ready the next time you open the app.

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

Use this as-is or as a foundation for a fuller prenatal companion app.
