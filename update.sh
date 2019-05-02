#!/usr/bin/env bash
set -x
set -e
./node_modules/.bin/ncu -u --semverLevel newest --upgradeAll -e 2 || (./node_modules/.bin/ncu -u --semverLevel newest --upgradeAll -e 1 && npm install)
