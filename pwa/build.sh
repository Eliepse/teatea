#!/bin/bash

docker build . --push --target prod -t registry.agency-ye.com/teatea/pwa:latest
