# PBWN AGM 2025 — Networking Directory App

A real-time networking directory for the Perthshire Business Women's Network AGM. Attendees self-register on the day, and everyone sees the directory update instantly.

---

## Tech Stack

- **Nuxt 3** — Vue-based framework
- **Tailwind CSS** — styling
- **Supabase** — real-time database + photo storage
- **Netlify** — hosting

---

## Setup Guide

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New project** and give it a name (e.g. `pbwn-agm`)
3. Once created, go to **SQL Editor** and paste the contents of `supabase-setup.sql`, then click **Run**
4. Go to **Database → Replication** and enable real-time for the `attendees` table
5. Go to **Settings → API** and copy your **Project URL** and **anon public key**

### 2. Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your values:

```env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-public-key
ADMIN_PIN=YourSecurePIN
```

> Choose a PIN your team will remember. Change it before going live.

### 3. Install dependencies and run locally

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

---

## Deploying to Netlify

### Option A — Via Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set SUPABASE_URL your-url
netlify env:set SUPABASE_KEY your-key
netlify env:set ADMIN_PIN YourSecurePIN
npm run generate
netlify deploy --prod --dir=.output/public
```

### Option B — Via Netlify dashboard (easier)

1. Push this project to a GitHub repo
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import from Git**
3. Select your repo
4. Set build command: `npm run generate`
5. Set publish directory: `.output/public`
6. Go to **Site settings → Environment variables** and add:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `ADMIN_PIN`
7. Click **Deploy site**

---

## Sharing the App on the Day

Once deployed, Netlify gives you a URL like `https://pbwn-agm-2025.netlify.app`.

**Options for sharing with attendees:**
- Display the URL on a projector slide
- Generate a QR code at [qr.io](https://qr.io) or [qr-code-generator.com](https://qr-code-generator.com) pointing to your URL
- Print the QR code and place it on tables

---

## Admin Panel

- Access via the **Admin** tab in the app
- Enter your PIN (set in `ADMIN_PIN` environment variable)
- The PIN is verified server-side — it is never exposed in the browser
- Export the full attendee list as a CSV at any time
- Clear all registrations if needed (useful for testing before the event)

---

## Project Structure

```
pbwn-agm/
├── components/
│   ├── RegisterTab.vue     # Self-registration form
│   ├── DirectoryTab.vue    # Real-time attendee grid + profile modal
│   └── AdminTab.vue        # PIN-protected admin controls
├── composables/
│   └── useAttendees.ts     # Supabase data fetching + real-time subscription
├── pages/
│   └── index.vue           # Main page with tab navigation
├── server/
│   └── api/
│       └── verify-pin.post.ts  # Server-side PIN verification
├── supabase-setup.sql      # Run once in Supabase SQL editor
├── nuxt.config.ts
├── tailwind.config.ts
├── netlify.toml
└── .env.example
```

---

## Customisation

### Change the sector list

Edit the `sectors` array in `components/RegisterTab.vue`.

### Change brand colours

Edit `tailwind.config.ts` — update the `purple` colour values to match your brand.

### Change the admin PIN

Update the `ADMIN_PIN` environment variable in Netlify. No code changes needed.
