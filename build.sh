#!/usr/bin/env bash

cd ./api || exit
./build.sh

cd ../pwa || exit
./build.sh
