#!/usr/bin/env Rscript
# test_r_packages.R
# This script lists installed packages and prints session info.

cat("=== Installed R Packages ===\n")
installed <- installed.packages()[, c("Package", "Version")]
print(installed)

cat("\n=== Session Information ===\n")
sessionInfo()