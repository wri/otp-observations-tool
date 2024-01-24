#!/bin/sh
set -e

echo 'Starting API...'

cd ../../otp-api
RAILS_ENV=e2e bundle exec rails e2e:setup
RAILS_ENV=e2e bundle exec rails s &

echo 'Starting Observations Tool...'
cd ../otp-observations-tool/
fnm use

if [ $1 = "dev" ]; then
  echo 'Starting dev server...'
  yarn dev
else
  echo 'Starting prod e2e server...'
  yarn start:e2e
fi

