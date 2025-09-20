#!/usr/bin/env bash

dist=${@:-./dist}

echo "[info] cleaning dist"
rm -rf $dist
