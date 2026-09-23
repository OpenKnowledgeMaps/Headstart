#!/bin/sh
# Run the R test suite inside the pipeline image.
#
# Bypasses the renv profile (R_PROFILE_USER=/dev/null) so the container's
# site-library packages (tm, stringr, logging, …) are importable — the replay
# tests need them, and renv sandboxes them off the library path. The pure-base-R
# unit tests are unaffected.
#
# Usage (from the other-scripts directory, e.g. via docker exec -w /headstart/other-scripts):
#   sh test/run_tests.sh                         # full suite
#   sh test/run_tests.sh test/test_replay_modes.R  # specific file(s)

cd "$(dirname "$0")/.." || exit 1
R_PROFILE_USER=/dev/null Rscript test/run_tests.R "$@"
