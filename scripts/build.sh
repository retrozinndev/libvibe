#!/usr/bin/env bash

dist=${@:-./dist}

if [[ -d "$dist" ]]; then
    sh scripts/clean.sh
fi

mkdir -p $dist
