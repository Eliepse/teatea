#!/usr/bin/env bash

docker build . --push --target prod -t registry.agency-ye.com/teatea/api:latest
