#!/bin/sh
set -e

cd ../../otp-api
RAILS_ENV=e2e bundle exec rails e2e:db_reset
