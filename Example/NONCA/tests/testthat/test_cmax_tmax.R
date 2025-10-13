
library(testthat)
library(NONCA)

test_that("cmax_tmax function works correctly", {
  # Test with a simple scenario
  data <- data.frame(Time = c(0, 1, 2, 4, 6, 8, 12, 24),
                     Concentration = c(0, 5, 10, 8, 6, 4, 2, 1))
  result <- cmax_tmax(data$Time, data$Concentration)
  expect_equal(result$Cmax, 10)
  expect_equal(result$Tmax, 2)

  # Test with multiple Cmax values (should take the first Tmax)
  data_multi_cmax <- data.frame(Time = c(0, 1, 2, 3, 4),
                                Concentration = c(0, 5, 5, 3, 2))
  result_multi_cmax <- cmax_tmax(data_multi_cmax$Time, data_multi_cmax$Concentration)
  expect_equal(result_multi_cmax$Cmax, 5)
  expect_equal(result_multi_cmax$Tmax, 1)

  # Test with all zeros
  data_zeros <- data.frame(Time = c(0, 1, 2), Concentration = c(0, 0, 0))
  result_zeros <- cmax_tmax(data_zeros$Time, data_zeros$Concentration)
  expect_equal(result_zeros$Cmax, 0)
  expect_equal(result_zeros$Tmax, 0)

  # Test with decreasing concentrations
  data_decreasing <- data.frame(Time = c(0, 1, 2, 3), Concentration = c(10, 8, 5, 2))
  result_decreasing <- cmax_tmax(data_decreasing$Time, data_decreasing$Concentration)
  expect_equal(result_decreasing$Cmax, 10)
  expect_equal(result_decreasing$Tmax, 0) # Assuming Tmax is 0 if Cmax is at Time 0

  # Test with empty input
  expect_error(cmax_tmax(numeric(0), numeric(0)))
})
