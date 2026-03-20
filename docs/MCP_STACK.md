# Mor Doo AI — Recommended MCP Servers

MCP (Model Context Protocol) servers that should be installed to accelerate development of the Mor Doo AI app. Organized by priority.

---

## Tier 1 — Install Immediately (Core Development)

### Expo MCP (Official)
- **URL:** `https://mcp.expo.dev/mcp`
- **Docs:** https://docs.expo.dev/eas/ai/mcp/
- **What it does:** Search Expo docs, install packages intelligently, take simulator screenshots, analyze app structure. SDK 54+ adds local dev server for live UI debugging.
- **Project use:** React Native development, debugging layouts, looking up Expo APIs.
- **Config:**
```json
{
  "mcpServers": {
    "expo": {
      "type": "http",
      "url": "https://mcp.expo.dev/mcp"
    }
  }
}
```

### Supabase MCP (Official)
- **URL:** `https://mcp.supabase.com/mcp`
- **Docs:** https://supabase.com/docs/guides/getting-started/mcp
- **What it does:** Database table operations, SQL execution, migrations, extension management (pgvector!), auth user management, storage bucket/file management, Edge Functions deployment, TypeScript type generation.
- **Project use:** Manages the entire backend data layer — migrations, auth, storage, edge functions — all from the editor. Can replace a lot of manual psql/dashboard work.
- **Config:**
```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
```

### Stripe MCP (Official)
- **URL:** `https://mcp.stripe.com`
- **npm:** `@stripe/mcp`
- **Docs:** https://docs.stripe.com/mcp
- **What it does:** Full Stripe API — create products, prices, payment links, manage subscriptions, refunds, disputes, coupons, invoices. Also searches Stripe documentation.
- **Project use:** Set up the 2 pricing tiers (Freemium/Standard ฿149), PromptPay integration, manage subscriptions. **v2:** Micro-transaction products, Premium tier.
- **Config:**
```json
{
  "mcpServers": {
    "stripe": {
      "type": "http",
      "url": "https://mcp.stripe.com"
    }
  }
}
```

### GitHub MCP (Official)
- **GitHub:** https://github.com/github/github-mcp-server
- **What it does:** Create/update issues and PRs, review code, manage project boards, monitor GitHub Actions, analyze build failures, manage releases, review Dependabot alerts.
- **Project use:** Issue management, PR automation, CI/CD monitoring for the mordoo repo.
- **Config:**
```json
{
  "mcpServers": {
    "github": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-e", "GITHUB_PERSONAL_ACCESS_TOKEN", "ghcr.io/github/github-mcp-server"]
    }
  }
}
```

---

## Tier 2 — Install for Phase 1 (Weeks 1-6)

### Postgres MCP Pro
- **pip:** `postgres-mcp`
- **GitHub:** https://github.com/crystaldba/postgres-mcp
- **What it does:** Full read/write database access, performance analysis, index recommendations, query EXPLAIN with hypothetical indexes, health checks (buffer cache, connections, vacuum), workload analysis.
- **Project use:** Database optimization, index tuning for pgvector queries, migration debugging. Much more powerful than the basic Postgres MCP.
- **Install:** `pipx install postgres-mcp`
- **Config:**
```json
{
  "mcpServers": {
    "postgres-pro": {
      "command": "postgres-mcp",
      "args": ["postgresql://user:pass@localhost:5432/mordoo"]
    }
  }
}
```

### Redis MCP (Official)
- **GitHub:** https://github.com/redis/mcp-redis
- **Docs:** https://redis.io/docs/latest/integrate/redis-mcp/
- **What it does:** Natural language interface for all Redis data types — strings, hashes, JSON, lists, sets, sorted sets, vectors. Read, write, query, server management.
- **Project use:** Managing session caches, rate limit counters, daily energy score cache, Celery task monitoring. **v2:** Crypto alerts cache.

### Sentry MCP (Official)
- **GitHub:** https://github.com/getsentry/sentry-mcp
- **Docs:** https://docs.sentry.io/product/sentry-mcp/
- **What it does:** Retrieve issues, errors, stack traces, and Seer AI analysis. Remote server with OAuth auth.
- **Project use:** Debug production crashes from both the RN app and FastAPI backend without leaving the editor.
- **Config:**
```json
{
  "mcpServers": {
    "sentry": {
      "type": "http",
      "url": "https://mcp.sentry.dev/sse"
    }
  }
}
```

### Figma Context MCP
- **GitHub:** https://github.com/GLips/Figma-Context-MCP
- **What it does:** Gives AI tools access to Figma layout data — better than screenshots for generating accurate UI code.
- **Project use:** Translating Figma designs into React Native components with accurate layout, spacing, colors. Critical for the mystical dark/gold UI.
- **Install:** `npx figma-developer-mcp --figma-api-key=YOUR_KEY`

---

## Tier 3 — Install for Phase 2 (Weeks 7-12)

### Firebase Tools MCP (Official Google)
- **GitHub:** https://github.com/firebase/firebase-tools/tree/main/src/mcp
- **What it does:** Create/manage Firebase projects, manage Auth users, Firestore, Data Connect, security rules.
- **Project use:** Firebase Auth setup (phone OTP), FCM configuration. **v2:** Moon phase alerts, crypto alerts.

### MCP FCM Push
- **GitHub:** https://github.com/kibotu/mcp-fcm-push
- **What it does:** Send push notifications via Firebase Cloud Messaging. Handles both Android FCM and iOS APNS.
- **Project use:** Testing push notifications during development — daily energy score alerts. **v2:** Moon phase alerts, crypto alerts.
- **Install:** Clone repo, `pip install -r requirements.txt`, configure service account JSON.

### Google Maps MCP
- **npm:** `@cablate/mcp-google-map`
- **GitHub:** https://github.com/cablate/mcp-google-map
- **What it does:** 17 tools — place search, geocoding, directions, distance matrix, nearby search, elevation, timezone, weather, air quality, static maps.
- **Project use:** **v2:** Temple Finder feature — search nearby temples, geocode addresses, calculate distances for the proximity search API.
- **Install:** `npx -y @cablate/mcp-google-map --stdio` with `GOOGLE_MAPS_API_KEY` env var.

### Twilio MCP (Official Alpha)
- **npm:** `@twilio-alpha/mcp`
- **GitHub:** https://github.com/twilio-labs/mcp
- **What it does:** All 1,400+ Twilio API endpoints. Send SMS, manage phone numbers, configure messaging services.
- **Project use:** Phone OTP verification for Thai users, SMS notifications.
- **Install:** `npx -y @twilio-alpha/mcp ACCOUNT_SID/API_KEY:API_SECRET`

### Replicate Image Gen MCP
- **npm:** `@gongrzhe/image-gen-server`
- **GitHub:** https://github.com/GongRzhe/Image-Generation-MCP-Server
- **What it does:** Text-to-image via Replicate FLUX model. Configurable prompt, dimensions, inference steps.
- **Project use:** App assets, sacred geometry images. **v2:** Digital amulet/Yantra generation.
- **Install:** `npm install -g @gongrzhe/image-gen-server` with `REPLICATE_API_TOKEN` env var.

---

## Tier 4 — Install for Phase 3+ (Months 4+)

### PostHog MCP (Official)
- **URL:** `https://mcp.posthog.com/`
- **Docs:** https://posthog.com/docs/model-context-protocol
- **What it does:** Query analytics data, manage feature flags, investigate error tracking issues, access stack traces.
- **Project use:** Investigate user funnels (onboarding drop-off, conversion rates), manage feature flags (A/B testing onboarding variants), debug client-side errors.

### Cloudflare MCP (Official)
- **GitHub:** https://github.com/cloudflare/mcp-server-cloudflare
- **What it does:** 2,500+ Cloudflare API endpoints — Workers, KV, D1, R2, DNS, WAF, DDoS, Zero Trust.
- **Project use:** Workers for edge caching, DNS management. **v2:** R2 storage management (amulet images, PDF reports).

### S3-Compatible MCP
- **GitHub:** https://github.com/txn2/mcp-s3
- **What it does:** Browse buckets, read/write objects, generate presigned URLs. Works with AWS S3, Cloudflare R2, and MinIO.
- **Project use:** **v2:** Managing file uploads and presigned URLs for amulet images and PDF reports.

### Docker MCP
- **GitHub:** https://github.com/QuantGeekDev/docker-mcp
- **What it does:** Container and Docker Compose stack management — create, start, stop, remove containers.
- **Project use:** Managing local dev containers (Postgres, Redis, Celery workers) from the editor.

---

## Quick Install Script

```bash
# Tier 1 — Add remote MCPs to Claude Code
claude mcp add expo --transport http https://mcp.expo.dev/mcp
claude mcp add supabase --transport http https://mcp.supabase.com/mcp
claude mcp add stripe --transport http https://mcp.stripe.com

# Tier 2 — Local MCPs
pipx install postgres-mcp
npm install -g @gongrzhe/image-gen-server

# React Native specific
npx -y @divagnz/mcp-react-native-expo  # Community RN best practices
```

---

## MCP → Issue Mapping

Which MCPs help with which issues:

| MCP Server | Helps With Issues |
|---|---|
| **Expo MCP** | #2, #3, #6, #7, #15, #18, #21 (all RN frontend work) |
| **Supabase MCP** | #9, #10, #16, #20, #27, #33, #36 (all database + auth) |
| **Stripe MCP** | #28, #29 (v1 pricing); #41 (v2: micro-transactions, Premium tier) |
| **GitHub MCP** | All issues (project management) |
| **Postgres MCP Pro** | #10, #16, #20, #27, #36 (schema design, query optimization) |
| **Redis MCP** | #16, #19, #20 (caching, rate limits, sessions) |
| **Sentry MCP** | #23, #35 (QA, production debugging) |
| **Figma Context** | #4, #6, #7, #15, #18 (all UI design work) |
| **Firebase/FCM MCP** | #9 (auth); #34 (push — v2: moon phase & crypto alerts) |
| **Google Maps MCP** | #26, #27 (v2: Temple Finder) |
| **Twilio MCP** | #9 (phone OTP) |
| **Replicate MCP** | #30, #31 (v2: amulet generation) |
| **PostHog MCP** | #23, #42 (analytics, ASO) |
| **Cloudflare MCP** | #31, #35, #44 (R2 storage, CDN) |
