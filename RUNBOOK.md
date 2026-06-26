# Runbook — SUST Codex Preliminary Backend

> Operational guide for incidents, deploys, and routine checks on the Poridhi VPS.

---

## 1. Service overview

| Component | Where |
|-----------|-------|
| App code | `/opt/sust-prili` |
| Built artifacts | `/opt/sust-prili/dist` |
| Environment file | `/etc/sust-prili/.env` (mode `600`) |
| Process manager | PM2 (`sust-prili` process name) |
| Reverse proxy | Nginx (`/etc/nginx/sites-available/sust-prili`) |
| Logs | `/var/log/sust-prili/` (PM2 logrotate) |

---

## 2. Health checks

```bash
# Liveness
curl -fsS https://api.example.com/health | jq

# Process health
pm2 status sust-prili
pm2 logs sust-prili --lines 200 --nostream
```

A `200 OK` with `status: ok` means the event loop is responsive.

---

## 3. Common incidents

### 3.1 Service is down

1. `pm2 status sust-prili`
2. If `errored` or `stopped`: `pm2 restart sust-prili`
3. If it crashes again within 30s: `pm2 logs sust-prili --lines 500 --nostream` — copy the last error.
4. Roll back: `pm2 deploy production revert` (or `git checkout <last-good-sha> && pnpm build && pm2 reload sust-prili`).

### 3.2 Slow responses

1. `pm2 monit` — check CPU / memory per worker.
2. `curl -w "@-" -o /dev/null -s https://api.example.com/health <<< "%{time_total}\n"`
3. Tail logs for `durationMs` outliers: `pm2 logs sust-prili --json | jq 'select(.durationMs > 1000)'`.

### 3.3 Bad deploy

```bash
cd /opt/sust-prili
git fetch --tags
git checkout <last-good-tag>
pnpm install --frozen-lockfile
pnpm build
pm2 reload sust-prili
```

### 3.4 Memory leak suspected

```bash
pm2 restart sust-prili          # immediate relief
pm2 logs sust-prili | grep -i oom
# Capture heap snapshot if reproducible (future: --inspect + DevTools)
```

---

## 4. Deploy

```bash
cd /opt/sust-prili
git pull --ff-only
pnpm install --frozen-lockfile
pnpm build
pm2 reload sust-prili            # zero-downtime cluster reload
pm2 save
```

`pm2 reload` performs a rolling restart one worker at a time.

---

## 5. Logs

```bash
# Stream
pm2 logs sust-prili

# Tail a specific worker
pm2 logs sust-prili --lines 500 --nostream

# Filter by request id
pm2 logs sust-prili --json | jq 'select(.reqId == "01HXYZ...")'
```

---

## 6. Graceful shutdown

On `SIGTERM` (PM2 reload, `pm2 stop`, system reboot):

1. HTTP server stops accepting new connections.
2. In-flight requests get up to `SHUTDOWN_TIMEOUT_MS` (default 15s).
3. Logger flushes.
4. Process exits 0.

If a second `SIGTERM` arrives or the timeout elapses, PM2 escalates to `SIGKILL`.

---

## 7. Scaling

Edit `ecosystem.config.cjs` (`instances`):

* `1` — single worker (debugging).
* `"max"` — one worker per CPU core.
* A fixed number — predictable memory footprint.

Reload with `pm2 reload sust-prili`.

---

## 8. Contacts

* Service owner: backend team
* Repo: see `package.json` → `repository`
