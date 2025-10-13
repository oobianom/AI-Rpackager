
library(testthat)
library(NONCA)

test_that("volume_distribution function works correctly", {
  # Test with a single dose and known values (Vz = CL / lambda_z)
  cl1 <- 5 # L/hr
  lambda_z1 <- 0.1 # 1/hr
  expected_vd1 <- cl1 / lambda_z1
  expect_equal(volume_distribution(clearance = cl1, lambda_z = lambda_z1), expected_vd1)

  # Test with different values
  cl2 <- 10
  lambda_z2 <- 0.2
  expected_vd2 <- cl2 / lambda_z2
  expect_equal(volume_distribution(clearance = cl2, lambda_z = lambda_z2), expected_vd2)

  # Test with lambda_z = 0 (should return Inf)
  expect_equal(volume_distribution(clearance = 5, lambda_z = 0), Inf)

  # Test with clearance = 0 (should return 0)
  expect_equal(volume_distribution(clearance = 0, lambda_z = 0.1), 0)

  # Test with negative clearance (should error)
  expect_error(volume_distribution(clearance = -5, lambda_z = 0.1))

  # Test with negative lambda_z (should error or warn, depending on desired behavior)
  expect_warning(volume_distribution(clearance = 5, lambda_z = -0.1))
  expect_equal(suppressWarnings(volume_distribution(clearance = 5, lambda_z = -0.1)), 5 / -0.1)

  # Test with non-numeric input
  expect_error(volume_distribution(clearance = "a", lambda_z = 0.1))
  expect_error(volume_distribution(clearance = 5, lambda_z = "b"))
})
