#!/bin/sh
#
# An example hook script to verify what is about to be committed.
# Called by "git commit" with no arguments.  The hook should
# exit with non-zero status after issuing an appropriate message if
# it wants to stop the commit.
#
# To enable this hook, rename this file to "pre-commit".

JSCS_ERROR="The npm package jscs is required for syntax checking, but it isn't installed. Please install it with 'npm install -g jscs'. Aborting."

command -v jscs >/dev/null 2>&1 || { echo >&2 $JSCS_ERROR; exit 1; }
#type jscs >/dev/null 2>&1 || { echo >&2 $JSCS_ERROR; exit 1; }
#hash jscs 2>/dev/null || { echo >&2 $JSCS_ERROR; exit 1; }

jscs -c .jscsrc app/scripts/*
