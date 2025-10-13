library(testthat)
library(NONCA)

test_that("auc_linear_log produces correct AUC for linear-log trapezoidal rule", {
  time <- c(0, 1, 2, 4, 8, 12, 24)
  conc <- c(0, 10, 25, 40, 30, 15, 5)
  expect_equal(round(auc_linear_log(time, conc), 2), 522.09)

  # Test with different concentrations
  conc2 <- c(0, 5, 15, 25, 20, 10, 2)
  expect_equal(round(auc_linear_log(time, conc2), 2), 296.81)

  # Test with single point
  expect_equal(auc_linear_log(c(0,1), c(0,10)), 5)

  # Test with decreasing concentrations
  conc3 <- c(10, 8, 6, 4, 2, 1, 0.5)
  expect_equal(round(auc_linear_log(time, conc3), 2), 58.74)
})

test_that("auc_inf produces correct AUC0-inf", {
  time <- c(0, 1, 2, 4, 8, 12, 24)
  conc <- c(0, 10, 25, 40, 30, 15, 5)
  lambda_z <- 0.05
  expect_equal(round(auc_inf(time, conc, lambda_z), 2), 622.09)

  # Test with different lambda_z
  lambda_z2 <- 0.1
  expect_equal(round(auc_inf(time, conc, lambda_z2), 2), 572.09)

  # Test with single point
  expect_error(auc_inf(c(0,1), c(0,10), 0.1)) # Should error as needs more points for lambda_z estimation

  # Test with decreasing concentrations
  conc3 <- c(10, 8, 6, 4, 2, 1, 0.5)
  lambda_z3 <- 0.15
  expect_equal(round(auc_inf(time, conc3, lambda_z3), 2), 65.41)
})
