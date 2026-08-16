# tiimeo

A minimal, mobile-first countdown for your day. It reads your Google Calendar
and shows what's happening **now**, how long it lasts, and what's **next** —
plus a "Dial" view that lays today out as a 24-hour circle (à la Sectograph).

Everything runs client-side in your browser. There's no backend and no
database: sign-in uses Google's own OAuth widget, the access token lives only
in this browser tab (`sessionStorage`), and calendar data is fetched directly
from Google's API and never sent anywhere else. That keeps this free to run
and avoids storing any of your data server-side.

## 1. Create a free Google OAuth client

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and
   create a new project (or reuse one) — this is free.
2. **APIs & Services → Library** → enable the **Google Calendar API**.
3. **APIs & Services → OAuth consent screen**:
   - User type: **External** (or Internal if you have Google Workspace).
   - Fill in the required app name / support email.
   - Add yourself as a **test user** under "Test users" — this keeps the app
     in "Testing" mode, which is fine for personal use and free forever
     (no verification needed as long as it's just you).
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**.
   - Add **Authorized JavaScript origins**: `http://localhost:3000` for local
     dev, and your deployed URL (e.g. `https://tiimeo.vercel.app`) once you
     have one.
   - No redirect URI is needed — this app uses the token flow, not a
     redirect-based one.
5. Copy the generated **Client ID** (looks like
   `123456-abc.apps.googleusercontent.com`).

## 2. Configure the app

Copy the example env file and paste your client ID in:

```bash
cp .env.local.example .env.local
```

```
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## 3. Run it locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000> and sign in with Google. Grant read-only
calendar access when prompted.

## 4. Deploy for free on Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new) (free Hobby tier).
3. Add the `NEXT_PUBLIC_GOOGLE_CLIENT_ID` environment variable in the Vercel
   project settings, same value as above.
4. Once deployed, go back to your Google Cloud OAuth client and add the
   Vercel URL to **Authorized JavaScript origins**.
5. Visit the site on your phone and use "Add to Home Screen" for an app-like
   icon and standalone window.

## How it works

- **Sign-in**: Google Identity Services' token client runs entirely in the
  browser (`src/lib/google-auth.ts`) — no client secret, no server round
  trip. The token is kept in `sessionStorage` and silently refreshed a
  minute before it expires; it disappears when you close the tab, matching
  a "sign in each session" model.
- **Sync**: `src/lib/calendar-api.ts` lists your visible calendars, then
  fetches today + tomorrow's events from each one directly from the Google
  Calendar REST API. It refreshes every 3 minutes and whenever the tab
  regains focus.
- **Countdown**: `src/hooks/useNow.ts` ticks every second; `src/lib/schedule.ts`
  derives what's current vs. next from that clock, so the UI updates live
  without re-fetching.
- **Colors**: each calendar gets a fixed, colorblind-safe categorical color
  (`src/lib/palette.ts`) assigned in a stable order (primary calendar first),
  used consistently across both the list and the dial view.

## Project structure

```
src/
  app/            Next.js routes, layout, icons, manifest
  components/      UI: sign-in screen, now/next cards, list view, dial view
  hooks/          useGoogleAuth, useCalendarEvents, useNow
  lib/            google-auth, calendar-api, schedule/time helpers, palette
```
