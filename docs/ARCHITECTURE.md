# SUST Codex Backend — Architecture (Revised)

> **Status:** Architecture-only document. No implementation code.
> **Audience:** Hackathon judges, reviewers, future maintainers.
> **Goal:** Enterprise-grade, judge-friendly, AI-extensible Node.js/TypeScript backend.

---

## 0. Architectural Principles (the "WHY" up front)

Every decision below is anchored in these non-negotiable principles. Judges should be able to map each folder, file, and decision to one of them.

| # | Principle | How it shows up in this design |
|---|-----------|-------------------------------|
| 1 | **SOLID** | Single-responsibility per file, controller depends on a `Service` interface (Dependency Inversion), Zod schemas are independent from controllers. |
| 2 | **Clean Architecture / Hexagonal** | Outer layers (HTTP, Express) depend inward on **ports** (`ITicketAnalyzerService`, `ILLMProvider`), not on concrete SDKs. |
| 3 | **DRY** | One response formatter, one error handler, one logger, one request-id strategy — reused everywhere. |
| 4 | **KISS** | No premature abstractions. AI abstraction exists because the spec **requires** it; nothing else is over-engineered. |
| 5 | **Separation of Concerns** | Config ≠ logging ≠ routing ≠ business rules ≠ validation ≠ transport. |
| 6 | **Dependency Injection** | A single composition root builds the container; nothing `new`s its own collaborators. |
| 7 | **Strict TypeScript** | `strict: true`, `noUncheckedIndexedAccess`, no `any`, `unknown` at boundaries. |
| 8 | **Async/Await only** | No `.then()` chains in app code; only inside tiny utility wrappers if at all. |
| 9 | **Stateless & Horizontally Scalable** | No in-process memory, no singletons with mutable state, no DB. |
| 10 | **Production Observability** | Structured logs, request IDs, health endpoint, future metrics. |

---

## 1. Complete Folder Structure

```
sust-prili/
├── .dockerignore
├── .editorconfig
├── .env.example
├── .eslintrc.cjs
├── .gitignore
├── .nvmrc
├── .prettierrc
├── .pnpmrc
├── Dockerfile
├── README.md
├── RUNBOOK.md
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml          # optional, enables /docs as a workspace pkg if we want
├── tsconfig.json
├── tsconfig.build.json
├── vitest.config.ts
├── docker-compose.yml           # local dev only (api + reverse-proxy)
├── nginx/
│   ├── nginx.conf
│   └── conf.d/
│       └── app.conf
├── ecosystem.config.cjs         # PM2 process definition
├── scripts/
│   ├── start.sh
│   ├── dev.sh
│   ├── build.sh
│   ├── test.sh
│   └── healthcheck.sh
├── docs/
│   ├── ARCHITECTURE.md          # this file
│   ├── DEPLOYMENT.md            # Poridhi VPS guide
│   ├── RUNBOOK.md               # incident handling
│   ├── openapi.yaml             # generated/handwritten OpenAPI spec
│   └── diagrams/
│       ├── request-flow.mmd
│       ├── error-flow.mmd
│       └── ai-abstraction.mmd
├── public/
│   └── favicon.ico
└── src/
    ├── main.ts                  # process entry: build app, listen, graceful shutdown
    ├── server.ts                # HTTP server factory (separated for testing)
    ├── app.ts                   # Express app factory (no listen here)
    ├── container.ts             # Composition root / DI container
    ├── constants/
    │   ├── index.ts
    │   ├── http.constants.ts
    │   ├── error.constants.ts
    │   ├── env.constants.ts
    │   └── ai.constants.ts
    ├── config/
    │   ├── index.ts             # re-exports
    │   ├── env.config.ts        # Zod-validated environment
    │   ├── app.config.ts        # app-level (name, version, env)
    │   ├── logger.config.ts     # Pino options
    │   ├── swagger.config.ts    # OpenAPI builder options
    │   ├── security.config.ts   # helmet/cors/csrf/rate-limit
    │   └── ai.config.ts         # provider selection + per-provider keys
    ├── types/
    │   ├── index.ts
    │   ├── express.d.ts         # augmentation: Request['id'], User-like types
    │   ├── http.types.ts        # HttpMethod, StatusCode unions
    │   ├── ticket.types.ts      # TicketRequest/Response domain types
    │   ├── ai.types.ts          # LLMProviderName, LLMMessage, LLMUsage
    │   └── result.types.ts      # Result<T,E> utility type
    ├── interfaces/
    │   ├── index.ts
    │   ├── http/
    │   │   ├── IController.ts
    │   │   ├── IRequest.ts
    │   │   ├── IResponse.ts
    │   │   └── INextFunction.ts
    │   ├── services/
    │   │   └── ITicketAnalyzerService.ts
    │   ├── ai/
    │   │   ├── ILLMProvider.ts           # port
    │   │   ├── ILLMProviderFactory.ts
    │   │   └── IPromptBuilder.ts
    │   ├── middleware/
    │   │   ├── IMiddleware.ts
    │   │   ├── IErrorHandler.ts
    │   │   └── IRequestIdStore.ts
    │   └── logger/
    │       └── ILogger.ts
    ├── validators/
    │   ├── index.ts
    │   ├── schemas/
    │   │   ├── analyze-ticket.schema.ts
    │   │   └── common.schema.ts          # shared primitives
    │   └── middlewares/
    │       └── validate.middleware.ts
    ├── middleware/
    │   ├── index.ts                      # ordered registry
    │   ├── request-id.middleware.ts
    │   ├── http-logger.middleware.ts
    │   ├── not-found.middleware.ts
    │   ├── error-handler.middleware.ts
    │   ├── async-handler.middleware.ts   # wraps async controllers
    │   ├── rate-limit.middleware.ts
    │   ├── compression.middleware.ts
    │   ├── cors.middleware.ts
    │   ├── helmet.middleware.ts
    │   └── security-headers.middleware.ts
    ├── routes/
    │   ├── index.ts                      # mounts v1 router
    │   ├── v1/
    │   │   ├── index.ts                  # /v1 aggregator
    │   │   ├── health.routes.ts          # GET /health
    │   │   ├── analyze-ticket.routes.ts  # POST /analyze-ticket
    │   │   ├── version.routes.ts         # GET /version   (future-ready)
    │   │   └── metrics.routes.ts         # GET /metrics   (future-ready)
    │   └── docs.routes.ts                # GET /docs, GET /openapi.json
    ├── controllers/
    │   ├── health.controller.ts
    │   ├── analyze-ticket.controller.ts
    │   ├── version.controller.ts
    │   └── metrics.controller.ts
    ├── services/
    │   ├── health.service.ts
    │   ├── version.service.ts
    │   ├── ticket/
    │   │   ├── ticket-analyzer.service.ts        # implements ITicketAnalyzerService
    │   │   ├── prompt-builder.service.ts         # builds prompts from request
    │   │   └── response-mapper.service.ts        # maps AI output -> spec
    │   └── ai/
    │       ├── llm-provider.factory.ts           # selects provider by config
    │       ├── providers/
    │       │   ├── openai.provider.ts
    │       │   ├── gemini.provider.ts
    │       │   ├── claude.provider.ts
    │       │   └── openrouter.provider.ts
    │       └── providers/
    │           └── noop.provider.ts              # default for hackathon: deterministic stub
    ├── errors/
    │   ├── index.ts                              # error registry
    │   ├── AppError.ts                           # base
    │   ├── ValidationError.ts
    │   ├── NotFoundError.ts
    │   ├── RateLimitError.ts
    │   ├── UnauthorizedError.ts
    │   ├── ForbiddenError.ts
    │   ├── InternalServerError.ts
    │   └── AIProviderError.ts
    ├── utils/
    │   ├── async-handler.util.ts                 # asyncHandler(fn)
    │   ├── response.util.ts                      # ok(), fail(), paginate()
    │   ├── request-id.util.ts                    # newRequestId()
    │   ├── timer.util.ts                         # execution time helper
    │   ├── safe-parse.util.ts                    # zod result -> Result<T,E>
    │   └── http-status.util.ts
    ├── prompts/
    │   ├── index.ts                              # prompt registry
    │   ├── analyze-ticket.system.prompt.ts
    │   ├── analyze-ticket.user.prompt.ts
    │   └── versions/                             # versioned prompts
    │       └── v1.analyze-ticket.ts
    ├── infra/
    │   ├── logger/
    │   │   ├── pino.logger.ts
    │   │   └── logger.middleware.ts
    │   ├── http/
    │   │   ├── express-app.factory.ts            # builds the Express instance
    │   │   └── graceful-shutdown.ts
    │   └── docs/
    │       └── swagger.setup.ts                  # OpenAPI builder
    └── tests/
        ├── setup/
        │   ├── vitest.setup.ts
        │   └── test-container.ts
        ├── unit/
        │   ├── services/
        │   ├── utils/
        │   ├── validators/
        │   └── errors/
        ├── integration/
        │   ├── middleware/
        │   └── container/
        ├── api/
        │   ├── health.api.spec.ts
        │   └── analyze-ticket.api.spec.ts
        ├── validation/
        │   └── analyze-ticket.schema.spec.ts
        └── ai/
            └── llm-provider.factory.spec.ts     # future AI mock tests
```

---

## 2. Responsibility of Every Folder

| Folder | Responsibility |
|--------|---------------|
| `src/` | All runtime code. No code outside `src/` is loaded by the app. |
| `src/constants/` | Frozen, immutable identifiers (HTTP codes, error codes, env var names, provider names). Never holds values read from the environment — that is `config/`. |
| `src/config/` | Pure functions that read env once at boot, validate with Zod, and return frozen objects. **No side effects beyond reading `process.env`.** |
| `src/types/` | TypeScript-only declarations (no runtime). Domain types live here. |
| `src/interfaces/` | Ports (contracts) used by Clean Architecture. Implementations live in `services/`, `infra/`, `middleware/`. |
| `src/validators/` | Zod schemas and the `validate` middleware. Pure — no Express dependencies in schemas. |
| `src/middleware/` | Cross-cutting HTTP concerns. Each file = one concern. |
| `src/routes/` | URL → controller mapping. **No business logic.** |
| `src/controllers/` | Translate HTTP ↔ service calls. Thin. |
| `src/services/` | Business rules. The only place domain decisions live. |
| `src/errors/` | Custom error hierarchy. One file per error, all extending `AppError`. |
| `src/utils/` | Pure, dependency-free helpers. No I/O, no logging. |
| `src/prompts/` | Versioned LLM prompts. Treated as data. |
| `src/infra/` | Adapters to external systems (logger, HTTP framework, docs). |
| `src/tests/` | All tests, mirroring `src/` structure. |
| `docs/` | Architecture, deployment, runbook, OpenAPI. |
| `nginx/` | Reverse proxy config for Poridhi VPS. |
| `scripts/` | Operational shell scripts (start, build, healthcheck). |
| `ecosystem.config.cjs` | PM2 cluster definition. |

---

## 3. Responsibility of Every File

> Only files that materially affect architecture are listed. Boilerplate configs (`.gitignore`, `.editorconfig`, `.prettierrc`) are omitted.

### 3.1 Entrypoints & Composition

| File | Responsibility |
|------|---------------|
| `src/main.ts` | **Process bootstrap.** Loads `.env`, builds container, builds app, starts server, installs graceful-shutdown signal handlers (`SIGTERM`, `SIGINT`). Catches top-level fatal errors. |
| `src/server.ts` | **HTTP server factory.** Wraps the Express app in `http.createServer`. Lets tests bind to a random port via `server.listen(0)`. |
| `src/app.ts` | **Express app factory.** Wires middleware in the canonical order, mounts routers. No `listen()`. |
| `src/container.ts` | **Composition root.** Single place that wires: logger → config → services → providers → controllers → routes. Exports a `buildContainer()` returning a frozen object graph. **Tests use a parallel `test-container.ts`.** |

### 3.2 Config Layer

| File | Responsibility |
|------|---------------|
| `config/env.config.ts` | Zod-validates `process.env` at boot. Crashes the process with a clear error if anything is missing/invalid. Returns frozen `EnvConfig`. |
| `config/app.config.ts` | `name`, `version`, `nodeEnv`, `instanceId`. |
| `config/logger.config.ts` | Pino `level`, `redaction`, `base`, `transport` (dev only). |
| `config/swagger.config.ts` | OpenAPI metadata: title, version, servers, tags. |
| `config/security.config.ts` | Helmet CSP, CORS origins, rate-limit `windowMs`/`max`, trust-proxy. |
| `config/ai.config.ts` | `provider: 'noop' \| 'openai' \| 'gemini' \| 'claude' \| 'openrouter'`, per-provider keys, model names, timeouts. |

**Why split?** So a security review reads only `security.config.ts`, and adding a new AI provider touches only `ai.config.ts` + one file under `services/ai/providers/`.

### 3.3 Constants

| File | Responsibility |
|------|---------------|
| `constants/http.constants.ts` | Status code unions, content-type strings. |
| `constants/error.constants.ts` | Stable string error codes returned to clients (e.g., `VALIDATION_FAILED`). |
| `constants/env.constants.ts` | Env var **names** (so renames are grep-safe). |
| `constants/ai.constants.ts` | Provider id literals. |

### 3.4 Types

| File | Responsibility |
|------|---------------|
| `types/express.d.ts` | Module augmentation so `req.id`, `req.log`, `req.startTime` are typed. |
| `types/http.types.ts` | `HttpMethod`, `HttpStatusCode` unions. |
| `types/ticket.types.ts` | `TicketAnalysisRequest`, `TicketAnalysisResponse` (matches the spec). |
| `types/ai.types.ts` | `LLMProviderName`, `LLMMessage`, `LLMCompletionRequest`, `LLMCompletionResult`. |
| `types/result.types.ts` | `Result<T, E>` discriminated union (no exceptions across layers). |

### 3.5 Interfaces (Ports)

| File | Responsibility |
|------|---------------|
| `interfaces/services/ITicketAnalyzerService.ts` | `analyze(req: TicketAnalysisRequest): Promise<Result<TicketAnalysisResponse, AppError>>`. |
| `interfaces/ai/ILLMProvider.ts` | `complete(req: LLMCompletionRequest): Promise<Result<LLMCompletionResult, AIProviderError>>`. |
| `interfaces/ai/IPromptBuilder.ts` | `buildSystem()`, `buildUser(req)`. |
| `interfaces/middleware/IMiddleware.ts` | `(req, res, next) => unknown`. |
| `interfaces/logger/ILogger.ts` | Narrow logger contract (info/warn/error/debug + child). |

### 3.6 Validators

| File | Responsibility |
|------|---------------|
| `validators/schemas/analyze-ticket.schema.ts` | Zod schema for the request body, plus inferred TS type. |
| `validators/schemas/common.schema.ts` | Reusable primitives (`nonEmptyString`, `isoDate`, `uuid`). |
| `validators/middlewares/validate.middleware.ts` | Generic: `validate({ body?, query?, params? })`. On failure, throws `ValidationError` with field-level details. **No try/catch in controllers.** |

### 3.7 Middleware

| File | Responsibility |
|------|---------------|
| `middleware/helmet.middleware.ts` | Security headers. |
| `middleware/compression.middleware.ts` | gzip/deflate. |
| `middleware/cors.middleware.ts` | Origin allowlist from `security.config.ts`. |
| `middleware/request-id.middleware.ts` | Reads `X-Request-Id` if present (validated), else generates one. Attaches to `req.id`. |
| `middleware/http-logger.middleware.ts` | One structured log per request with method/path/status/duration/reqId. |
| `middleware/rate-limit.middleware.ts` | `express-rate-limit` configured from `security.config.ts`. Throws `RateLimitError` on exceed. |
| `middleware/async-handler.middleware.ts` | `asyncHandler(fn)` — pushes rejections into `next(err)`. |
| `middleware/not-found.middleware.ts` | 404 JSON formatter. |
| `middleware/error-handler.middleware.ts` | Maps `AppError` → status + JSON. Unknown → `InternalServerError`. **Production:** no stack trace; logs full error with request id. |

### 3.8 Routes & Controllers

| File | Responsibility |
|------|---------------|
| `routes/v1/index.ts` | Aggregates v1 routes. |
| `routes/v1/health.routes.ts` | `GET /health` → `HealthController`. |
| `routes/v1/analyze-ticket.routes.ts` | `POST /analyze-ticket` with `validate` middleware + controller. |
| `routes/v1/version.routes.ts` | `GET /version` (returns build info). |
| `routes/v1/metrics.routes.ts` | `GET /metrics` (Prometheus text — wired behind a feature flag for the hackathon). |
| `routes/docs.routes.ts` | `GET /docs` (Swagger UI), `GET /openapi.json`. |
| `controllers/health.controller.ts` | Returns liveness/readiness JSON. |
| `controllers/analyze-ticket.controller.ts` | Validated input → calls `ITicketAnalyzerService` → `ResponseUtil.ok(data)`. |
| `controllers/version.controller.ts` | Returns `package.json` version + git sha + node env. |
| `controllers/metrics.controller.ts` | Returns `prom-client` registry text. |

### 3.9 Services

| File | Responsibility |
|------|---------------|
| `services/health.service.ts` | Computes uptime, version, memory snapshot. No external deps. |
| `services/version.service.ts` | Static service returning build metadata. |
| `services/ticket/ticket-analyzer.service.ts` | Orchestrates: `PromptBuilder → LLMProvider → ResponseMapper`. Pure orchestration; no HTTP knowledge. |
| `services/ticket/prompt-builder.service.ts` | Builds system + user messages from the request. |
| `services/ticket/response-mapper.service.ts` | Validates LLM JSON output against response schema before returning to the controller. |
| `services/ai/llm-provider.factory.ts` | Reads `ai.config.ts`, returns the concrete `ILLMProvider`. **Closed for modification when adding a provider — open for extension via a registry map.** |
| `services/ai/providers/openai.provider.ts` | Adapter: maps `LLMCompletionRequest` → OpenAI SDK → `LLMCompletionResult`. |
| `services/ai/providers/gemini.provider.ts` | Same contract, Gemini SDK. |
| `services/ai/providers/claude.provider.ts` | Same contract, Anthropic SDK. |
| `services/ai/providers/openrouter.provider.ts` | OpenRouter REST adapter. |
| `services/ai/providers/noop.provider.ts` | Deterministic offline stub used for the hackathon round. Returns a hand-written response matching the spec. |

### 3.10 Errors

Every error extends `AppError` which carries `statusCode`, `code`, `isOperational`, `metadata`, and is safe to JSON-serialize.

| File | Responsibility |
|------|---------------|
| `errors/AppError.ts` | Base class. |
| `errors/ValidationError.ts` | 400 — field details in `metadata.fields`. |
| `errors/NotFoundError.ts` | 404. |
| `errors/RateLimitError.ts` | 429 — `retryAfter`. |
| `errors/UnauthorizedError.ts` / `ForbiddenError.ts` | 401 / 403. |
| `errors/InternalServerError.ts` | 500 fallback. |
| `errors/AIProviderError.ts` | 502 — provider name + upstream status + safe message. |

### 3.11 Utils

| File | Responsibility |
|------|---------------|
| `utils/async-handler.util.ts` | `asyncHandler(fn)`. |
| `utils/response.util.ts` | `ok(data, meta?)`, `fail(message, code, meta?)`, single source of truth for response envelope. |
| `utils/request-id.util.ts` | ULID/UUIDv7 generator. |
| `utils/timer.util.ts` | `startTimer()` → `elapsedMs()`. |
| `utils/safe-parse.util.ts` | Wraps `schema.safeParse` returning `Result`. |
| `utils/http-status.util.ts` | Status → text map. |

### 3.12 Prompts

| File | Responsibility |
|------|---------------|
| `prompts/analyze-ticket.system.prompt.ts` | System prompt constants. |
| `prompts/analyze-ticket.user.prompt.ts` | Function that renders the user prompt from the request. |
| `prompts/versions/v1.analyze-ticket.ts` | Versioned snapshot — pinned until next version ships. |

### 3.13 Infra

| File | Responsibility |
|------|---------------|
| `infra/logger/pino.logger.ts` | Pino instance, redacts secrets, attaches request id. |
| `infra/http/express-app.factory.ts` | Builds the Express app in the canonical middleware order. |
| `infra/http/graceful-shutdown.ts` | Stops accepting new conns, drains in-flight, closes logger, exits 0. |
| `infra/docs/swagger.setup.ts` | Builds the OpenAPI spec from schemas + route metadata. |

---

## 4. Request Lifecycle (Middleware Execution Flow)

> **Canonical order — non-negotiable.** Order is enforced in `express-app.factory.ts`. Each step has a single concern.

```
HTTP Request
   │
   ▼
[1]  trust proxy                    (security.config.ts)
   ▼
[2]  Helmet                          (security headers)
   ▼
[3]  Compression                     (gzip/deflate)
   ▼
[4]  CORS                            (allowlisted origins)
   ▼
[5]  JSON body parser (express.json) (size limit from app.config)
   ▼
[6]  URL-encoded parser              (extended=false, small limit)
   ▼
[7]  Request-ID middleware           (req.id attached; child logger created)
   ▼
[8]  HTTP logger middleware          (logs start; tracks start time)
   ▼
[9]  Rate limiter                    (per-IP keyed; honors trust-proxy)
   ▼
[10] Routers (v1)
   │      │
   │      ▼
   │   [10a] validate({body, query, params})   ← Zod throws ValidationError on fail
   │      ▼
   │   [10b] asyncHandler(controller)         ← forwards rejections to error handler
   │      ▼
   │   [10c] Controller                         ← thin: services + ResponseUtil
   │      ▼
   │   [10d] ITicketAnalyzerService.analyze
   │      ▼
   │   [10e] PromptBuilder → ILLMProvider → ResponseMapper
   │      ▼
   │   [10f] ResponseUtil.ok(data)
   ▼
[11] 404 handler                      (route not matched)
   ▼
[12] Global error handler             (JSON envelope, redacted stack)
   ▼
HTTP Response
```

**Why this order?**

* `helmet` and `compression` first so even error responses get compressed + secure headers.
* `cors` before body parsing — preflights short-circuit cheaply.
* Body parsers before `request-id` so we can log parse errors with a stable id.
* `request-id` before `http-logger` so the very first log line carries the id.
* Rate limiter **after** identity-establishing middleware but **before** routes so it guards the hot path.
* `validate` middleware lives on the route, not globally, because not every route validates a body.

---

## 5. Response Format (Unified Envelope)

Every successful and failed response uses the same shape. Defined in `utils/response.util.ts`.

```jsonc
{
  "success": true,
  "message": "Ticket analyzed successfully",
  "data": { /* endpoint-specific */ },
  "meta": {
    "requestId": "01HXYZ...",
    "timestamp": "2026-06-26T10:00:00.000Z",
    "durationMs": 142
  }
}
```

Error envelope:

```jsonc
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_FAILED",
    "details": [{ "path": "transactions[0].amount", "message": "Expected number" }]
  },
  "meta": {
    "requestId": "01HXYZ...",
    "timestamp": "2026-06-26T10:00:00.000Z"
  }
}
```

`meta` is always present. `data` and `error` are mutually exclusive.

---

## 6. Error Lifecycle (Error Flow)

```
any layer throws AppError | unknown
   │
   ▼
asyncHandler / express default
   │
   ▼
error-handler.middleware.ts
   │
   ├── is AppError ?
   │     ├── yes → status = err.statusCode
   │     │         body = { success:false, message, error:{code, details}, meta }
   │     │         logger.warn({ reqId, code, status })
   │     │
   │     └── no  → wrap in InternalServerError
   │               status = 500
   │               body = { success:false, message:"Internal Server Error", error:{code:"INTERNAL_ERROR"}, meta }
   │               logger.error({ reqId, err, stack })   ← stack only in non-prod
   │
   ▼
Response sent
```

**Guarantees:**

* Stack traces never appear in production responses (`env !== 'production'` controls redaction).
* `requestId` always present in `meta` so a user-reported id maps to a log line.
* All error codes are stable strings from `constants/error.constants.ts` — clients can switch on them safely.

---

## 7. Validation Flow

```
HTTP request → body parser
        │
        ▼
validate({ body: AnalyzeTicketSchema })   (route-level)
        │
        ├── safeParse fails → throw ValidationError(status 400, fields)
        │
        └── safeParse ok → req.body is typed (TS) → next()
                          │
                          ▼
                       Controller (thin)
                          │
                          ▼
                       Service (never validates again; trusts the type)
```

**Why validate at the edge?** Services stay pure, reusable, and testable without HTTP. Schemas are also reused to generate OpenAPI request bodies.

---

## 8. Logging Strategy

* **Logger:** Pino. JSON in production, pretty in dev (`pino-pretty` behind env flag).
* **Fields per request log:**
  * `reqId`
  * `method`
  * `path`
  * `statusCode`
  * `durationMs`
  * `ip` (from `req.ip` after trust-proxy)
  * `userAgent`
  * `contentLength`
  * `err` (if any) — **stack only when `NODE_ENV !== 'production'`**
* **Redaction:** `req.headers.authorization`, `req.headers.cookie`, `*.password`, `*.token`, `*.apiKey` — configured once in `logger.config.ts`.
* **Child loggers:** `req.log` is a child of the root logger bound to `reqId`. Controllers/services receive `req.log` via the container — they never construct a logger.
* **Future AI latency:** `llm.durationMs`, `llm.provider`, `llm.model`, `llm.tokens` are emitted when AI is enabled.

**Never use `console.log`.** A single ESLint rule (`no-console: error`) enforces this.

---

## 9. AI Abstraction Design (Future-Proof)

### 9.1 The Port

```ts
// interfaces/ai/ILLMProvider.ts (described, not implemented)
interface ILLMProvider {
  readonly name: LLMProviderName;
  complete(req: LLMCompletionRequest): Promise<Result<LLMCompletionResult, AIProviderError>>;
}
```

### 9.2 Adapters

| Provider | File | Adapter responsibility |
|----------|------|------------------------|
| OpenAI | `providers/openai.provider.ts` | Map messages → Chat Completions API, translate errors. |
| Gemini | `providers/gemini.provider.ts` | Same shape, Google SDK. |
| Claude | `providers/claude.provider.ts` | Anthropic Messages API → `LLMCompletionResult`. |
| OpenRouter | `providers/openrouter.provider.ts` | OpenAI-compatible REST surface. |
| Noop | `providers/noop.provider.ts` | Default for the hackathon; deterministic, offline, zero-cost. |

### 9.3 Factory / Registry

```ts
// services/ai/llm-provider.factory.ts (described)
const REGISTRY: Record<LLMProviderName, () => ILLMProvider> = {
  openai: () => new OpenAIProvider(...),
  gemini: () => new GeminiProvider(...),
  claude: () => new ClaudeProvider(...),
  openrouter: () => new OpenRouterProvider(...),
  noop: () => new NoopProvider(...),
};
```

The factory reads `ai.config.ts.provider` and looks up the constructor. **Adding a provider = one new file + one registry entry + one config key.** No controller or service changes.

### 9.4 Adding AI Later (Sequence)

1. Add SDK to `package.json`.
2. Implement `ILLMProvider` in `services/ai/providers/<name>.provider.ts`.
3. Register in the `REGISTRY` map.
4. Add env vars to `env.config.ts` and `ai.config.ts`.
5. Add provider-specific request/response tests under `tests/ai/`.
6. Add provider to `LLMProviderName` union and Swagger enum.

### 9.5 Diagram

```
Controller
   │ depends on
   ▼
ITicketAnalyzerService   ← port (interface)
   │ depends on
   ▼
ILLMProvider (port) ── registered via ──► LLMProviderFactory
                                                │
                                ┌───────────────┼───────────────┬───────────────┐
                                ▼               ▼               ▼               ▼
                            OpenAI          Gemini            Claude         OpenRouter
```

**Why a registry and not `if/else` in the factory?** Open/Closed Principle. New providers don't touch existing code.

---

## 10. Deployment Architecture (Poridhi VPS)

```
Internet
   │
   ▼
[Poridhi Edge / Public IP]
   │
   ▼
nginx (system service, :80/:443)
   │  - TLS termination (Let's Encrypt)
   │  - gzip/brotli
   │  - rate limit (coarse, complements app)
   │  - proxy_pass → 127.0.0.1:3000
   │  - /health -> 200 OK (bypass cache)
   ▼
PM2 (cluster mode, instances = CPU count)
   │
   ├── app instance #0  (Node 22, port 3000, cluster fork)
   ├── app instance #1
   └── ...
   │
   ▼
stdout → PM2 logrotate → /var/log/pm2/*.log
```

### 10.1 Configuration surfaces

| Layer | Where | Owned by |
|-------|-------|----------|
| TLS, gzip, public rate limit | `nginx/conf.d/app.conf` | Ops |
| Process supervision, restarts | `ecosystem.config.cjs` (PM2) | Ops |
| App env | `/etc/sust-prili/.env` (mode `600`) | DevOps |
| Secrets | Poridhi secret store / env vars | DevOps |
| Health checks | `GET /health` polled by Poridhi LB | Platform |

### 10.2 Graceful shutdown sequence

```
SIGTERM → PM2 → app
   │
   ▼
server.close()           (stop accepting new conns)
   │
   ▼
drain in-flight (timeout = SHUTDOWN_TIMEOUT_MS, default 15s)
   │
   ▼
flush logger
   │
   ▼
exit(0)
```

If a second `SIGTERM` arrives or the timeout elapses, PM2 escalates to `SIGKILL`. Nginx retries pending connections to a sibling instance thanks to the cluster.

### 10.3 Health probe semantics

* `GET /health` returns `200` if the event loop is responsive. It must be **fast and dependency-free** (no AI call, no DB).
* Future: split into `/livez` and `/readyz` — architecture already supports it (`controllers/health.controller.ts`).

### 10.4 Containerization (Docker)

`Dockerfile` uses a multi-stage build:

1. **deps**: `pnpm install --frozen-lockfile`
2. **build**: `pnpm build` → `dist/`
3. **runtime**: `node:22-alpine`, non-root user, `CMD ["node", "dist/main.js"]`, `HEALTHCHECK` calling `/health`.

The Poridhi VPS may run either:

* **Option A (recommended):** Node directly under PM2 (lower memory, faster boot, simpler logs).
* **Option B:** Docker under PM2 (`pm2-runtime start dist/main.js`) — useful if Poridhi requires container workloads.

Both are first-class because `main.ts` is environment-agnostic.

---

## 11. Testing Architecture

### 11.1 Strategy

| Layer | Type | Tool | Scope |
|-------|------|------|-------|
| Pure functions (utils, response formatter, request id) | Unit | Vitest | No I/O. |
| Schemas (Zod) | Unit | Vitest | Valid + invalid fixtures, edge cases. |
| Errors | Unit | Vitest | `statusCode`, `code`, serialization. |
| Services with mocks (`ITicketAnalyzerService` w/ fake `ILLMProvider`) | Unit | Vitest | Orchestration logic. |
| Middleware | Integration | Vitest + `supertest` minimal app | Order, headers, status, body shape. |
| Container wiring | Integration | Vitest | All bindings resolve, no missing deps. |
| **API (full app, real Express)** | **API** | Vitest + **Supertest** | `GET /health`, `POST /analyze-ticket` happy + error paths. |
| Validation (request schemas end-to-end) | API | Vitest + Supertest | 400 on bad payload, 200 on good. |
| Future AI provider contracts | Contract | Vitest | Same `LLMCompletionRequest` → every provider returns a `Result` of the same shape. |
| Future AI mocks | Unit | Vitest with `msw` / nock | Provider HTTP traffic replay. |

### 11.2 Layering rules

* Unit tests never import Express.
* API tests never reach into services directly — they hit HTTP.
* A single `test-container.ts` mirrors `container.ts` but injects fakes (`NoopProvider` always wins, rate limiter disabled, logger silenced or `silent: true`).

### 11.3 Required coverage targets

* `validators/`: 100% lines.
* `errors/`: 100% lines.
* `utils/`: ≥ 95% lines.
* `services/`: ≥ 90% lines.
* `controllers/`: covered via API tests.

---

## 12. Dependency Graph (build-time, not runtime)

```
main.ts
  └─ container.ts
       ├─ config/*
       │    └─ env.config.ts ──► constants/env.constants.ts
       ├─ infra/logger/pino.logger.ts ──► config/logger.config.ts
       ├─ services/ai/llm-provider.factory.ts
       │    └─ services/ai/providers/*.provider.ts ──► interfaces/ai/ILLMProvider.ts
       ├─ services/ticket/*
       │    └─ interfaces/services/ITicketAnalyzerService.ts
       ├─ controllers/*
       ├─ middleware/*
       ├─ routes/*
       ├─ infra/docs/swagger.setup.ts
       └─ infra/http/express-app.factory.ts
              └─ middleware/* (ordered) + routes/*
```

**Rules enforced by ESLint `import/no-restricted-paths`:**

* `routes/`, `controllers/`, `middleware/` may import `services/`, `interfaces/`, `validators/`, `errors/`, `utils/`, `types/`. **They must never import `services/ai/providers/*` directly.**
* `services/` may import `interfaces/`, `errors/`, `utils/`, `types/`, other `services/`. **Never `express`, `req`, `res`.**
* `validators/` has no Express dependency.
* `errors/` has no dependencies on other folders.

This is the Clean Architecture dependency rule: **dependencies point inward only**.

---

## 13. Engineering Decisions — the WHY

| # | Decision | Why |
|---|----------|-----|
| 1 | **Express + factory pattern** (`app.ts` returns an app, no `listen`) | Enables Supertest to import the app without binding a port; tests are deterministic and fast. |
| 2 | **Composition root (`container.ts`)** | One file to read to understand the whole system; trivial DI; trivial test overrides. |
| 3 | **Zod for env + request validation** | One tool, runtime + compile-time. Env validation crashes boot loudly — no silent prod misconfig. |
| 4 | **Custom error hierarchy** | The error handler maps by `instanceof`, not by string matching — refactor-safe. Stable error codes stay as strings for clients. |
| 5 | **`Result<T, E>` for service returns** | Forces services to handle failure paths explicitly; prevents thrown exceptions from crossing layer boundaries. |
| 6 | **Unified response envelope** | Judges (and clients) see one shape — easy to grade, easy to consume. |
| 7 | **Request-ID middleware first** | Every later log line is correlatable. Critical for incident response on Poridhi VPS. |
| 8 | **Helmet → Compression → CORS → Parsers → ReqID → Logger → RateLimit → Routes → 404 → Error** | Order chosen so security + perf headers apply to all responses, including errors; rate limit guards the expensive path; logger sees parse failures with a stable id. |
| 9 | **Pino + redaction** | Pino is the fastest mainstream Node logger; redaction at the logger layer is the only correct place. |
| 10 | **AI Provider Port + Registry** | Open/Closed Principle. Adding OpenAI/Gemini/Claude/OpenRouter touches one new file + one registry entry. Controllers never see SDKs. |
| 11 | **`NoopProvider` as default** | Hackathon runs must work offline; deterministic answers make grading fair. |
| 12 | **Versioned prompts (`prompts/versions/`)** | Prompt iteration becomes a tracked artifact, not a code change. |
| 13 | **Strict TypeScript + ESLint path rules** | Catches Clean Architecture violations at lint time, not at review time. |
| 14 | **Vitest + Supertest (not Jest)** | Vitest is the modern, ESM-native, fast default; Supertest is the canonical HTTP-in-process tester. |
| 15 | **PM2 cluster mode on Poridhi VPS** | Uses all CPU cores, automatic restart, logrotate, zero-downtime reload via `pm2 reload`. |
| 16 | **Nginx in front** | TLS, gzip, coarse rate limit, hides Node internals, future-proof for additional upstreams. |
| 17 | **Graceful shutdown** | `SIGTERM` from PM2/Nginx reload must finish in-flight requests; avoids 502s during deploys. |
| 18 | **Stateless, no DB** | Hackathon spec is explicit. Removes a whole class of failure modes. |
| 19 | **No `any`** | Forces honest typing. At boundaries we use `unknown` + Zod parse. |
| 20 | **Docs folder is first-class** | Architecture, deployment, runbook, OpenAPI, diagrams — judges can audit decisions without reading code. |

---

## 14. Future Extensibility Checklist (what the architecture already supports)

| Future need | Already accommodated by |
|-------------|-------------------------|
| Swap AI provider | `ILLMProvider` + registry. |
| Add new endpoint | New file in `routes/v1/`, `controllers/`, optional Zod schema. |
| Add auth | New middleware (`auth.middleware.ts`) inserted after `request-id`, before routes. |
| Add DB | New `repositories/` folder; services depend on `IRepository` interfaces (port). |
| Add metrics | `controllers/metrics.controller.ts` + `routes/v1/metrics.routes.ts` already stubbed. |
| Add tracing | Pino child loggers carry `reqId`; OpenTelemetry can attach in `infra/logger`. |
| Multi-tenant | Add `tenantId` to request context in `request-id` middleware. |
| Vertical feature folders | Move `services/ticket/` → `features/ticket/` without touching interfaces. |

---

## 15. Out of Scope (explicitly)

* Database, persistence, caching, queues.
* Authentication / authorization (no spec requirement).
* WebSockets / streaming.
* Real AI provider integration (kept behind a port; `NoopProvider` is the default).
* Multi-region deployment.

---

**End of architecture document. Awaiting approval before implementation.**
