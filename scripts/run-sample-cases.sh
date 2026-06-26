#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-http://localhost:3000}"
CASES_FILE="docs/preli-problem-statement/SUST_Preli_Sample_Cases.json"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required to run this script" >&2
  exit 1
fi

jq -c '.cases[]' "$CASES_FILE" | while read -r case; do
  id=$(echo "$case" | jq -r '.id')
  input=$(echo "$case" | jq '.input')
  echo "=== $id ==="
  curl -s -X POST "$BASE_URL/analyze-ticket" \
    -H "Content-Type: application/json" \
    -d "$input" | jq '{ ticket_id, relevant_transaction_id, evidence_verdict, case_type, department, severity }'
done
