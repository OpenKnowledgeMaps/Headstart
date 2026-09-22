# Minimal testthat-compatible shim.
#
# The pipeline image does not ship `testthat`, so this provides just the subset
# of the API our unit tests use, letting the suite run inside the container. When
# the real `testthat` is installed the runner uses it instead and this file is
# not sourced. Results accumulate in `.shim_results`; run_tests.R reports them.

.shim_results <- new.env(parent = emptyenv())
.shim_results$pass <- 0L
.shim_results$fail <- 0L
.shim_results$failures <- character(0)

.shim_fail <- function(msg) {
  stop(structure(class = c("expectation_failure", "error", "condition"),
                 list(message = msg, call = NULL)))
}

test_that <- function(desc, code) {
  ok <- tryCatch({ force(code); TRUE },
    expectation_failure = function(e) {
      .shim_results$fail <- .shim_results$fail + 1L
      .shim_results$failures <- c(.shim_results$failures,
                                  paste0(desc, ": ", conditionMessage(e)))
      cat("  FAIL: ", desc, " — ", conditionMessage(e), "\n", sep = "")
      FALSE
    },
    error = function(e) {
      .shim_results$fail <- .shim_results$fail + 1L
      .shim_results$failures <- c(.shim_results$failures,
                                  paste0(desc, " [error]: ", conditionMessage(e)))
      cat("  ERROR: ", desc, " — ", conditionMessage(e), "\n", sep = "")
      FALSE
    })
  if (isTRUE(ok)) {
    .shim_results$pass <- .shim_results$pass + 1L
    cat("  ok: ", desc, "\n", sep = "")
  }
  invisible(ok)
}

expect_equal <- function(object, expected, ...) {
  if (!isTRUE(all.equal(object, expected)))
    .shim_fail(paste0("expected ", deparse(expected), " but got ", deparse(object)))
  invisible(TRUE)
}

expect_identical <- function(object, expected, ...) {
  if (!identical(object, expected))
    .shim_fail(paste0("not identical: got ", deparse(object), " vs ", deparse(expected)))
  invisible(TRUE)
}

expect_true <- function(object, ...) {
  if (!isTRUE(object)) .shim_fail("expected TRUE")
  invisible(TRUE)
}

expect_false <- function(object, ...) {
  if (!isFALSE(object)) .shim_fail("expected FALSE")
  invisible(TRUE)
}

expect_null <- function(object, ...) {
  if (!is.null(object)) .shim_fail(paste0("expected NULL but got ", deparse(object)))
  invisible(TRUE)
}

expect_match <- function(object, regexp, ...) {
  if (!any(grepl(regexp, object)))
    .shim_fail(paste0("'", paste(object, collapse=","), "' does not match /", regexp, "/"))
  invisible(TRUE)
}

expect_error <- function(object, ...) {
  err <- tryCatch({ force(object); NULL }, error = function(e) e)
  if (is.null(err)) .shim_fail("expected an error but none was raised")
  invisible(TRUE)
}
