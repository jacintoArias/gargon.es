#!/bin/bash

docker-compose build
docker-compose run --rm web cat /opt/app/yarn.lock > /tmp/yarn.lock

if ! diff -q yarn.lock /tmp/yarn.lock > /dev/null  2>&1; then
  echo "Saving yarn.lock"
  cp /tmp/yarn.lock yarn.lock
fi