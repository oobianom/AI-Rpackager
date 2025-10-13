
library(testthat)
library(NONCA)

test_that("accumulation_ratio function works correctly", {
  # Test with known values (Rac = (1 - exp(-k*tau))^-1, or Css / C1 if single dose)
  # For now, let's assume it's Cmax,ss / Cmax,1
  cmax_ss1 <- 50
  cmax_1_1 <- 10
  expected_rac1 <- cmax_ss1 / cmax_1_1
  expect_equal(accumulation_ratio(cmax_ss = cmax_ss1, cmax_1 = cmax_1_1), expected_rac1)

  # Test with different values
  cmax_ss2 <- 100
  cmax_1_2 <- 20
  expected_rac2 <- cmax_ss2 / cmax_1_2
  expect_equal(accumulation_ratio(cmax_ss = cmax_ss2, cmax_1 = cmax_1_2), expected_rac2)

  # Test with cmax_1 = 0 (should return Inf)
  expect_equal(accumulation_ratio(cmax_ss = 50, cmax_1 = 0), Inf)

  # Test with cmax_ss = 0 (should return 0, assuming cmax_1 > 0)
  expect_equal(accumulation_ratio(cmax_ss = 0, cmax_1 = 10), 0)

  # Test with negative cmax_ss (should error)
  expect_error(accumulation_ratio(cmax_ss = -50, cmax_1 = 10))

  # Test with negative cmax_1 (should error)
  expect_error(accumulation_ratio(cmax_ss = 50, cmax_1 = -10))

  # Test with non-numeric input
  expect_error(accumulation_ratio(cmax_ss = "a", cmax_1 = 10))
  expect_error(accumulation_ratio(cmax_ss = 50, cmax_1 = "b"))
})
