#!/bin/sh

./restore-db.sh

echo 'Starting API...'

cd ../../otp-api
POSTGRES_DATABASE=fti_api_cypress bundle exec rails db:migrate
POSTGRES_DATABASE=fti_api_cypress bundle exec rails s &

echo 'Starting Observations Tool...'
cd ../otp-observations-tool/
fnm use
yarn start:e2e
