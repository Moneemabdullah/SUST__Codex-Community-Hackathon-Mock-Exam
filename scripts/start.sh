#!/usr/bin/env bash
set -euo pipefail

echo "[start] Building..."
pnpm build

echo "[start] Starting under PM2..."
pm2 startOrReload ecosystem.config.cjs --env production
pm2 save