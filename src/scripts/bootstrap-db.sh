#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/bootstrap-db.sh [container-name] [wait-seconds]
CONTAINER="${1:-postgres-quiz}"
WAIT_SECONDS="${2:-60}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

HOST_INIT="$REPO_ROOT/scripts/init-database.sql"
HOST_MIG="$REPO_ROOT/scripts/migration-users-permissions.sql"
HOST_SEED="$REPO_ROOT/scripts/seed-data.sql"

if [[ ! -f "$HOST_INIT" || ! -f "$HOST_MIG" || ! -f "$HOST_SEED" ]]; then
  echo "[BOOTSTRAP] Missing migration/seed/init files. Expected at:"
  echo "  $REPO_ROOT/scripts/init-database.sql"
  echo "  $REPO_ROOT/scripts/migration-users-permissions.sql"
  echo "  $REPO_ROOT/scripts/seed-data.sql"
  exit 1
fi

TMP_INIT="/tmp/init-database.sql"
TMP_MIG="/tmp/migration.sql"
TMP_SEED="/tmp/seed-data.sql"

command -v docker >/dev/null 2>&1 || { echo "docker command not found" >&2; exit 1; }
docker inspect "$CONTAINER" >/dev/null 2>&1 || { echo "Container '$CONTAINER' not found. Start it first." >&2; exit 1; }

# detect admin user inside container
container_postgres_user="$(docker exec "$CONTAINER" printenv POSTGRES_USER 2>/dev/null || true)"
container_postgres_user="$(echo -n "$container_postgres_user" | xargs || true)"
if [[ -n "$container_postgres_user" ]]; then
  ADMIN_USER="$container_postgres_user"
else
  ADMIN_USER="postgres"
fi
echo "[BOOTSTRAP] Using admin user: $ADMIN_USER"

wait_postgres() {
  local timeout=${1:-60}
  local start_ts end_ts
  start_ts=$(date +%s)
  end_ts=$((start_ts + timeout))

  while [[ $(date +%s) -lt $end_ts ]]; do
    if docker exec "$CONTAINER" pg_isready -U "$ADMIN_USER" -d postgres >/dev/null 2>&1; then
      echo "[BOOTSTRAP] Postgres ready"
      return 0
    fi
    sleep 2
  done
  return 1
}

if ! wait_postgres "$WAIT_SECONDS"; then
  echo "[BOOTSTRAP] Postgres did not become ready within $WAIT_SECONDS seconds." >&2
  exit 1
fi

# normalize line endings if dos2unix available (helps Windows authored files)
maybe_normalize() {
  local file="$1"
  if command -v dos2unix >/dev/null 2>&1; then
    dos2unix -q "$file" || true
  fi
}

exec_psql_file_in_container() {
  local host_path="$1"
  local tmp_path="$2"
  local psql_user="$3"
  local target_db="${4:-postgres}"

  echo "[BOOTSTRAP] Copying $host_path -> ${CONTAINER}:$tmp_path"
  docker cp "$host_path" "${CONTAINER}:$tmp_path"

  echo "[BOOTSTRAP] Verify file inside container:"
  docker exec "$CONTAINER" ls -l "$tmp_path" || true

  # Run psql using bash -c inside container so that /tmp path is resolved inside container
  echo "[BOOTSTRAP] Running: docker exec -i $CONTAINER bash -c \"psql -v ON_ERROR_STOP=1 -U $psql_user -d $target_db -f $tmp_path\""
  if docker exec -i "$CONTAINER" bash -c "psql -v ON_ERROR_STOP=1 -U $psql_user -d $target_db -f $tmp_path"; then
    echo "[BOOTSTRAP] Applied $host_path inside container."
    return 0
  fi

  echo "[BOOTSTRAP] psql -f failed; attempting fallback by streaming host file into psql (stdin)."
  if docker exec -i "$CONTAINER" psql -v ON_ERROR_STOP=1 -U "$psql_user" -d "$target_db" < "$host_path"; then
    echo "[BOOTSTRAP] Fallback (stdin) succeeded for $host_path."
    return 0
  fi

  echo "[BOOTSTRAP] Both psql -f and stdin fallback failed for $host_path" >&2
  return 1
}

# helper to run a small query and capture trimmed output
run_query_trim() {
  local user="$1"; local db="$2"; local sql="$3"
  docker exec -i "$CONTAINER" psql -U "$user" -d "$db" -tA -q -c "$sql" 2>/dev/null || true
}

# check existing DB and role against 'postgres' DB
db_raw="$(run_query_trim "$ADMIN_USER" "postgres" "SELECT 1 FROM pg_database WHERE datname='quizmate';")"
role_raw="$(run_query_trim "$ADMIN_USER" "postgres" "SELECT 1 FROM pg_roles WHERE rolname='quizmate_user';")"

db_exists="$(echo -n "$db_raw" | xargs || true)"
role_exists="$(echo -n "$role_raw" | xargs || true)"

echo "[BOOTSTRAP] dbExists='${db_exists}' roleExists='${role_exists}'"

if [[ "$db_exists" != "1" || "$role_exists" != "1" ]]; then
  echo "[BOOTSTRAP] Database or role missing. Applying init-database.sql as $ADMIN_USER ..."
  maybe_normalize "$HOST_INIT"
  exec_psql_file_in_container "$HOST_INIT" "$TMP_INIT" "$ADMIN_USER" "postgres"
  echo "[BOOTSTRAP] Init script applied."
else
  echo "[BOOTSTRAP] Database and role already exist. Skipping init."
fi

echo "[BOOTSTRAP] Applying migration: migration-users-permissions.sql"
maybe_normalize "$HOST_MIG"
if ! exec_psql_file_in_container "$HOST_MIG" "$TMP_MIG" "$ADMIN_USER" "quizmate"; then
  echo "[BOOTSTRAP] Migration failed." >&2
  exit 1
fi
echo "[BOOTSTRAP] Migration applied."

echo "[BOOTSTRAP] Applying seed: seed-data.sql"
maybe_normalize "$HOST_SEED"
if ! exec_psql_file_in_container "$HOST_SEED" "$TMP_SEED" "quizmate_user" "quizmate"; then
  echo "[BOOTSTRAP] Seed failed." >&2
  exit 1
fi
echo "[BOOTSTRAP] Seed applied."

echo "[BOOTSTRAP] Listing tables in quizmate:"
docker exec -i "$CONTAINER" psql -U quizmate_user -d quizmate -c "\dt"

echo "[BOOTSTRAP] Done."
