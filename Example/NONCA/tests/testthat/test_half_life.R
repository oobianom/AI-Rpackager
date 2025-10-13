
library(testthat)
library(NONCA)

test_that("half_life function works correctly", {
  # Test with a known lambda_z
  lambda_z_val <- 0.1
  expected_half_life <- log(2) / lambda_z_val
  expect_equal(half_life(lambda_z_val), expected_half_life)

  # Test with different lambda_z
  lambda_z_val2 <- 0.5
  expected_half_life2 <- log(2) / lambda_z_val2
  expect_equal(half_life(lambda_z_val2), expected_half_life2)

  # Test with zero lambda_z (should return Inf)
  expect_equal(half_life(0), Inf)

  # Test with negative lambda_z (should produce a warning and a negative half-life)
  expect_warning(half_life(-0.1))
  expect_equal(suppressWarnings(half_life(-0.1)), log(2) / -0.1)

  # Test with non-numeric input
  expect_error(half_life("a"))
})
