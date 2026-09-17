#!/bin/sh
set -e

# Cloud Run injects $PORT at runtime — default to 8080 locally.
: "${PORT:=8080}"

# Substitute only the PORT variable, leaving $uri etc. untouched.
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'