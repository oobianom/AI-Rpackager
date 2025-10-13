
library(testthat)
library(NONCA)

test_that("mrt function works correctly", {
  # Test with known values (MRT = AUMCinf / AUCinf)
  aumc_inf1 <- 200 # mg*hr^2/L
  auc_inf1 <- 20 # mg*hr/L
  expected_mrt1 <- aumc_inf1 / auc_inf1
  expect_equal(mrt(aumc_inf = aumc_inf1, auc_inf = auc_inf1), expected_mrt1)

  # Test with different values
  aumc_inf2 <- 500
  auc_inf2 <- 50
  expected_mrt2 <- aumc_inf2 / auc_inf2
  expect_equal(mrt(aumc_inf = aumc_inf2, auc_inf = auc_inf2), expected_mrt2)

  # Test with auc_inf = 0 (should return Inf)
  expect_equal(mrt(aumc_inf = 200, auc_inf = 0), Inf)

  # Test with aumc_inf = 0 (should return 0, assuming auc_inf > 0)
  expect_equal(mrt(aumc_inf = 0, auc_inf = 20), 0)

  # Test with negative aumc_inf (should error)
  expect_error(mrt(aumc_inf = -200, auc_inf = 20))

  # Test with negative auc_inf (should error)
  expect_error(mrt(aumc_inf = 200, auc_inf = -20))

  # Test with non-numeric input
  expect_error(mrt(aumc_inf = "a", auc_inf = 20))
  expect_error(mrt(aumc_inf = 200, auc_inf = "b"))
})
