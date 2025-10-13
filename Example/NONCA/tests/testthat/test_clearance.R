
library(testthat)
library(NONCA)

test_that("clearance function works correctly", {
  # Test with a single dose and known values
  dose1 <- 100 # mg
  auc_inf1 <- 20 # mg*hr/L
  expected_cl1 <- dose1 / auc_inf1
  expect_equal(clearance(dose = dose1, auc_inf = auc_inf1), expected_cl1)

  # Test with different values
  dose2 <- 250
  auc_inf2 <- 50
  expected_cl2 <- dose2 / auc_inf2
  expect_equal(clearance(dose = dose2, auc_inf = auc_inf2), expected_cl2)

  # Test with auc_inf = 0 (should return Inf)
  expect_equal(clearance(dose = 100, auc_inf = 0), Inf)

  # Test with dose = 0 (should return 0)
  expect_equal(clearance(dose = 0, auc_inf = 20), 0)

  # Test with negative dose (should error)
  expect_error(clearance(dose = -100, auc_inf = 20))

  # Test with negative auc_inf (should error)
  expect_error(clearance(dose = 100, auc_inf = -20))

  # Test with non-numeric input
  expect_error(clearance(dose = "a", auc_inf = 20))
  expect_error(clearance(dose = 100, auc_inf = "b"))
})
