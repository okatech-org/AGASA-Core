#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?DATABASE_URL est requis}"

MIGRATIONS_DIR=${MIGRATIONS_DIR:-infra/postgres/migrations}

if ! command -v psql >/dev/null 2>&1; then
  echo "Erreur: psql introuvable. Installe PostgreSQL client."
  exit 1
fi

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "Erreur: dossier migrations introuvable: $MIGRATIONS_DIR"
  exit 1
fi

echo "Application des migrations depuis $MIGRATIONS_DIR"
for file in "$MIGRATIONS_DIR"/*.sql; do
  [ -e "$file" ] || continue
  echo " -> $(basename "$file")"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
done

echo "Migrations terminées."
