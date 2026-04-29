# Fourfold Parallel — Architecture Spec

## Goal

Two separate services (React app + bible-api) running in Docker locally and deployed to Cloud Run.
React app fetches verses from bible-api. No broken imports, no env-var URL sprawl.

---

## Services

### 1. fourfold-parallel (React / Vite)

- Dev: `npm run dev --host` inside Docker, Vite proxy forwards `/process` to bible-api
- Prod: `npm run build` -> static files served by nginx, nginx `proxy_pass` to bible-api Cloud Run URL
- Port: 3000 (dev) / 80 (prod nginx)

### 2. bible-api

- Source: cloned from https://github.com/undergroundchurch/bible-api.git
- Runs on port 3001
- Deployed as separate Cloud Run service
- URL injected into fourfold-parallel at build/deploy time via `BIBLE_API_INTERNAL_URL`

---

## Networking

### Local Docker (dev)

```
Browser -> localhost:3000 (Vite dev server)
                |
         Vite proxy /process
                |
         bible-api:3001 (Docker DNS)
```

### Cloud Run (prod)

```
Browser -> fourfold-parallel Cloud Run service (port 3000 or 80)
                |
         nginx proxy_pass /process
                |
         bible-api Cloud Run service (HTTPS internal URL)
```

---

## URL Strategy

- Browser always calls relative `/process` — never a hardcoded host
- Vite proxy (dev) or nginx (prod) resolve the actual bible-api URL server-side
- `BIBLE_API_INTERNAL_URL` env var controls target in both contexts
- `Apis.js` deleted — no more `VITE_BIBLE_API_URL` / `VITE_BIBLE_API_PORT`
- `src/verses/index.js` calls `axios.post('/process', { segments })`

---

## Open Decisions

- [ ] bible-api CORS: if browser ever calls bible-api directly (bypass proxy), CORS headers needed
- [ ] Dockerfile for prod: needs nginx stage (multi-stage build) instead of `npm run dev`
