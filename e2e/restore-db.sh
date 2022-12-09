#!/bin/sh

cd ../../db
./restore.sh test_db_backup.dump fti_api_cypress
