#!/bin/sh
set -e

echo 'Starting API...'

cd ../../otp-api
RAILS_ENV=e2e bundle exec rails e2e:setup
RAILS_ENV=e2e bundle exec rails s &

echo 'Starting Observations Tool...'
cd ../otp-observations-tool/
fnm use
yarn start:e2e
