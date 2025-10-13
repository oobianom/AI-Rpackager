
library(testthat)
library(NONCA)

test_that("bioavailability function works correctly", {
  # Test with IV and Oral doses and corresponding AUCs
  auc_oral1 <- 100
  dose_oral1 <- 200
  auc_iv1 <- 150
  dose_iv1 <- 100
  expected_f1 <- (auc_oral1 * dose_iv1) / (auc_iv1 * dose_oral1)
  expect_equal(bioavailability(auc_oral = auc_oral1, dose_oral = dose_oral1, auc_iv = auc_iv1, dose_iv = dose_iv1), expected_f1)

  # Test with different values
  auc_oral2 <- 80
  dose_oral2 <- 160
  auc_iv2 <- 120
  dose_iv2 <- 80
  expected_f2 <- (auc_oral2 * dose_iv2) / (auc_iv2 * dose_oral2)
  expect_equal(bioavailability(auc_oral = auc_oral2, dose_oral = dose_oral2, auc_iv = auc_iv2, dose_iv = dose_iv2), expected_f2)

  # Test with auc_iv = 0 (should return Inf, if dose_iv > 0 and (auc_oral * dose_iv) > 0)
  expect_equal(bioavailability(auc_oral = 100, dose_oral = 200, auc_iv = 0, dose_iv = 100), Inf)

  # Test with dose_oral = 0 (should return Inf, if auc_iv > 0 and (auc_oral * dose_iv) > 0)
  expect_equal(bioavailability(auc_oral = 100, dose_oral = 0, auc_iv = 150, dose_iv = 100), Inf)

  # Test with all zeros for AUCs and doses
  expect_equal(bioavailability(auc_oral = 0, dose_oral = 0, auc_iv = 0, dose_iv = 0), NaN)

  # Test with negative values (should error)
  expect_error(bioavailability(auc_oral = -100, dose_oral = 200, auc_iv = 150, dose_iv = 100))
  expect_error(bioavailability(auc_oral = 100, dose_oral = -200, auc_iv = 150, dose_iv = 100))

  # Test with non-numeric input
  expect_error(bioavailability(auc_oral = "a", dose_oral = 200, auc_iv = 150, dose_iv = 100))
})
