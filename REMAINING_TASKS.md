# Remaining Tasks

_Last updated: 2026-10-17. Check items off as you finish; ask the agent to
handle anything marked "[agent]"._

## 🔴 Tomorrow's must-dos

- [ ] **Check the first CI run** — open the GitHub repo's **Actions** tab
      (https://github.com/palak-arch/cammand/actions). Two pushes already
      triggered runs (lint → test → build). Confirm they're green; if a run
      failed, paste the log.
- [ ] **Browser click-through of the live preview** — open
      https://site-9d0ba7e1d9014c13b19727c1bbee8378.freebuff.page , click
      **Sign in with Freebuff**, complete the sign-in, confirm your name
      appears in the sidebar and the dashboard loads, then **Sign Out** from
      the sidebar. This is the only unverified part of the auth flow.

## 🟡 Google Search Console (from today's session)

- [ ] Go to https://search.google.com/search-console → **Add property** →
      **URL prefix** → paste `https://site-9d0ba7e1d9014c13b19727c1bbee8378.freebuff.page`
- [ ] Verification method **HTML tag** → copy the `content="…"` code and
      **paste it in the chat** → [agent] adds the meta tag and redeploys
- [ ] After **Verify** succeeds: left menu → **Sitemaps** → submit
      `sitemap.xml` (already live at /sitemap.xml)

## 🟢 When ready to go bigger

- [ ] **Custom domain** — add it in the Freebuff Sites settings, then tell
      the agent to update sitemap.xml + robots.txt URLs and re-verify
- [ ] **Production environment** — when you want the real site live: agent
      enables Sign in with Freebuff on production and publishes it
      (preview stays as-is)
- [ ] **Real backend** — the last big one for going live properly: replace
      the bundled mock data with a real API (e.g., Workers + D1), keep
      `VITE_USE_MOCK=false`; the frontend already routes every read/write
      through the service layer, so it plugs in without UI changes

## 🔵 Nice-to-haves (agent can do anytime)

- [ ] Error-path tests for Dashboard & Monitoring pages (hook-level covered;
      page-level would complete the set)
- [ ] Dark mode via Tailwind v4 `@custom-variant dark`
- [ ] LICENSE file (MIT?) — currently none
