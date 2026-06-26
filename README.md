# SUST Codex — Preliminary Backend

Enterprise-grade Node.js + TypeScript backend built for the **SUST Codex Community Hackathon Preliminary Round**.

> Stateless. Production-ready. AI-extensible.

---

## What this service does

* Exposes a **liveness** endpoint: `GET /health`
* Exposes a **ticket analysis** endpoint: `POST /analyze-ticket` (scaffolded; awaiting approval)
* Returns a **single unified JSON envelope** for every response (success and error)
* Validates every input at the edge using **Zod**
* Logs every request with a **stable request id**
* Runs under **PM2** behind **Nginx** on a Poridhi VPS

---

## Quick start

```bash
# 1. Install dependencies
pnpm install

# 2. Copy environment defaults
cp .env.example .env

# 3. Run in development mode
pnpm dev

# 4. Or build and run production
pnpm build
pnpm start
```

Open <http://localhost:3000/health>.

---

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Run with `tsx watch` (auto-reload on file changes). |
| `pnpm build` | Compile TypeScript to `dist/`. |
| `pnpm start` | Run compiled output. |
| `pnpm test` | Run the Vitest suite once. |
| `pnpm test:watch` | Vitest in watch mode. |
| `pnpm lint` | Lint all source and test files. |
| `pnpm lint:fix` | Auto-fix lint issues. |
| `pnpm format` | Format with Prettier. |
| `pnpm format:check` | Verify formatting without changes. |
| `pnpm typecheck` | Type-check without emitting. |

---

## Project structure

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the complete architecture document, including:

* Folder and file responsibilities
* Middleware execution order
* Request and error lifecycle
* AI abstraction design (OpenAI, Gemini, Claude, OpenRouter)
* Deployment architecture for Poridhi VPS

---

## Tech stack

* **Runtime:** Node.js 22+
* **Language:** TypeScript 5 (strict)
* **HTTP:** Express 4
* **Validation:** Zod 3
* **Logging:** Pino + pino-http
* **Security:** Helmet, CORS, express-rate-limit
* **Docs:** swagger-jsdoc + swagger-ui-express
* **Testing:** Vitest + Supertest
* **Process manager (prod):** PM2
* **Reverse proxy (prod):** Nginx
