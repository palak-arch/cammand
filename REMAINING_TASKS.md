# Remaining Tasks

_Last updated: 2026-10-18. Check items off as you finish; ask the agent to
handle anything marked "[agent]"._

## 🔴 Tomorrow's must-dos

- [x] **Check the first CI run** — ✅ verified 2026-10-18: run #7 on
      commit `31ed575` (auth cleanup) completed with conclusion `success`
      (lint → test → build) at https://github.com/palak-arch/cammand/actions
      . Only the browser click-through below remains unverified.
- [ ] **Browser click-through of the live preview** — open
      https://site-9d0ba7e1d9014c13b19727c1bbee8378.freebuff.page , click
      **Sign in with Freebuff** on the landing page, complete the sign-in,
      confirm you land back on the requested page, then check your name and
      avatar in the sidebar, the "signed in as…" notice in **Settings**
      (Dismiss works), and **Sign Out** in the sidebar (a POST handled by the
      Worker). This is the only unverified part of the auth flow — note the
      live site runs the previous bundle until the agent redeploys.

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

## 🚀 SEO & launch readiness (do after the basics above)

- [ ] **Fast loading on real devices** — run a Lighthouse audit (mobile
      preset) on the live preview and aim for Performance ≥ 90. The bundle
      is already lean (~100 kB gz); re-check after any new pages or images.
- [ ] **Works on mobile** — open the site on an actual phone (or Chrome
      DevTools device mode): landing, login, dashboard, tables, and the
      mobile sidebar must all be usable with no overlap or horizontal scroll.
- [ ] **No broken links** — click every link on the public pages (nav,
      footer, CTAs, auth links). [agent] can also add an automated
      link-check script to CI so this never regresses.
- [ ] **Post useful content** — add pages/posts that answer specific
      questions your customers search for (e.g. "how to monitor EC2 CPU
      usage", "EC2 cost monitoring checklist"). One genuinely helpful page
      beats ten thin ones.
- [ ] **SEO on every page** — unique `<title>` and `<meta name="description">`
      per page with the keywords people actually search; one clear `<h1>`
      per page; descriptive alt text on images. [agent] can audit
      index.html and wire per-route document titles.

## 📚 Documentation pack (write these as files in /docs)

- [ ] **docs/PRD.md** — product requirements: target users, core features,
      success metrics, out-of-scope list
- [ ] **docs/design.md** — design system: navy theme tokens, component
      inventory, responsive rules, a11y standards
- [ ] **docs/architecture.md** — system diagram: SPA → Worker (Sign in with
      Freebuff) → service layer → mock data / real API, plus deploy flow
- [ ] **docs/database.md** — data models: current mock shapes + planned D1
      schema (users, instances, alerts, activities)
- [ ] **docs/API.md** — the endpoint contract the services already call
      (/auth, /ec2, /alerts, /monitoring, /users, /activities)
- [ ] **docs/agents.md** — instructions for AI agents working in this repo:
      commands, conventions, deploy/push flow, guardrails
- [x] **README.md** — exists and is maintained (update as things change)

## 🧩 Project process

- [ ] **Project implementation plan** — turn the remaining work (backend,
      content, SEO) into ordered milestones with dates
- [ ] **Setup & initialisation** — verify a fresh clone works: `npm ci` →
      `npm run dev` using only `.env.example` (no hidden local state)
- [ ] **Feature development workflow** — move to branch → PR → CI green →
      merge instead of pushing straight to main
- [ ] **Authentication & security** — auth cleanup done 2026-10-18
      (Freebuff-only: password form, demo login and local session storage
      removed; single h1 per page; sign-in returnTo round trip tested).
      Next: security headers / CSP on the Worker and a periodic dependency
      audit
- [ ] **MCP connection** — set up an MCP server (e.g., GitHub) so agents can
      manage issues, PRs and releases directly
- [ ] **Integrations** — planned: real backend API, alert channels
      (email/Slack), analytics (e.g., Plausible)
- [ ] **Testing & QA** — extend coverage; add an end-to-end browser test
      (Playwright) for login → dashboard → logout
- [ ] **Debugging** — establish the workflow: error logging/monitoring
      (e.g., Sentry), source maps in preview, bug-report checklist

## 🔵 Nice-to-haves (agent can do anytime)

- [ ] Error-path tests for Dashboard & Monitoring pages (hook-level covered;
      page-level would complete the set)
- [ ] Dark mode via Tailwind v4 `@custom-variant dark`
- [ ] LICENSE file (MIT?) — currently none
