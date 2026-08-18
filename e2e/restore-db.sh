#!/bin/sh
set -e

API="$(dirname "$0")/../../otp-api"

# Fall back to the rake task while the API repo is missing bin/e2e-db-reset.
if [ -f "$API/bin/e2e-db-reset" ]; then
  exec sh "$API/bin/e2e-db-reset"
else
  cd "$API"
  exec env RAILS_ENV=e2e bundle exec rails e2e:db_reset
fi
