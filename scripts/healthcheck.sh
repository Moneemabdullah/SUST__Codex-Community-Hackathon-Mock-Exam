#!/usr/bin/env bash
set -euo pipefail

HOST="${HEALTH_HOST:-127.0.0.1}"
PORT="${HEALTH_PORT:-3000}"
URL="http://${HOST}:${PORT}/health"

echo "[healthcheck] GET ${URL}"
response=$(curl -fsS -o /tmp/health.body -w "%{http_code}" "${URL}" || true)
echo "[healthcheck] status=${response}"
cat /tmp/health.body
echo

if [[ "${response}" != "200" ]]; then
  echo "[healthcheck] FAILED" >&2
  exit 1
fi

echo "[healthcheck] OK"