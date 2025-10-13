
library(testthat)
library(NONCA)

test_that("lambda_z function works correctly", {
  # Test with a simple exponential decay
  time <- c(0, 1, 2, 3, 4, 5, 6)
  conc <- c(10, 8.2, 6.7, 5.5, 4.5, 3.7, 3.0)
  result <- lambda_z(time, conc, n_points = 3)
  # Expected lambda_z value can be pre-calculated or estimated for comparison
  expect_s3_class(result, "list")
  expect_named(result, c("lambda_z", "r_squared", "start_time", "end_time", "data_points"))
  expect_true(result$lambda_z > 0)
  expect_true(result$r_squared > 0)

  # Test with more complex data, ensuring n_points is respected
  time2 <- c(0.5, 1, 2, 4, 6, 8, 12, 16, 24)
  conc2 <- c(15, 25, 30, 28, 22, 16, 8, 4, 2)
  result2 <- lambda_z(time2, conc2, n_points = 4)
  expect_s3_class(result2, "list")
  expect_true(result2$lambda_z > 0)

  # Test for insufficient data points
  expect_error(lambda_z(c(1, 2), c(10, 5), n_points = 3), "Not enough data points to estimate lambda_z")

  # Test with all zero concentrations
  time_zeros <- c(0, 1, 2, 3)
  conc_zeros <- c(0, 0, 0, 0)
  expect_error(lambda_z(time_zeros, conc_zeros), "Cannot estimate lambda_z with all zero concentrations or non-positive values for log transformation.")

  # Test with non-numeric inputs
  expect_error(lambda_z(c("a", "b"), c(1, 2)))
})
