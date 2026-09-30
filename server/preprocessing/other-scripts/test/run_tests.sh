#!/bin/sh
# Run the R test suite inside the pipeline image.
#
# Bypasses the renv profile (R_PROFILE_USER=/dev/null) so the container's
# packages (tm, stringr, logging, …) are importable without renv's sandbox — the
# replay tests need them. Images that install them into the renv project library
# instead of the site library get that library prepended to R_LIBS. The
# pure-base-R unit tests are unaffected.
#
# Usage (from the other-scripts directory, e.g. via docker exec -w /headstart/other-scripts):
#   sh test/run_tests.sh                         # full suite
#   sh test/run_tests.sh test/test_replay_modes.R  # specific file(s)

cd "$(dirname "$0")/.." || exit 1
for lib in ../renv/library/*/R-*/*/ ../renv/library/R-*/*/; do
  if [ -d "$lib/tm" ]; then
    R_LIBS="$(cd "$lib" && pwd)${R_LIBS:+:$R_LIBS}"
    export R_LIBS
    break
  fi
done
R_PROFILE_USER=/dev/null Rscript test/run_tests.R "$@"
