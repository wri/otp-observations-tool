#!/bin/sh

cd ../../db
./restore.sh test_db_backup.dump fti_api_cypress

cd ../otp-api
POSTGRES_DATABASE=fti_api_cypress bundle exec rails db:migrate
