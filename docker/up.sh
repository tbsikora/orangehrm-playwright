#!/usr/bin/env sh
# Builds and (re)starts the stack.
#
# --renew-anon-volumes is required: orangehrm/orangehrm:5.9 declares
# VOLUME /var/www/html, so every container gets an anonymous volume there.
# Compose carries that volume forward across recreates by default, which means
# a plain `docker compose up -d` after rebuilding the image silently keeps
# serving web/dist from whatever image first created the volume - rebuilding
# docker/Dockerfile (e.g. after editing docker/patches or patch-oxd-testids.js)
# has no visible effect until the volume is renewed.
set -eu
cd "$(dirname "$0")/.."
docker compose up -d --build --force-recreate --renew-anon-volumes "$@"
