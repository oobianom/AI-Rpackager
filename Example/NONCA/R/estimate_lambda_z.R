
#' Estimate the terminal elimination rate constant (lambda_z).
#'
#' This function estimates the terminal elimination rate constant (lambda_z)
#' by performing a log-linear regression on the terminal phase of the concentration-time curve.
#' The terminal phase is typically identified as the points where concentrations are decreasing
#' log-linearly. The function requires at least three data points for estimation.
#'
#' @param time A numeric vector of time points. Must be non-negative and sorted in ascending order.
#' @param concentration A numeric vector of drug concentrations corresponding to the `time` points.
#'   Must be of the same length as `time`. Concentrations must be positive for log transformation.
#' @param n_points The number of terminal data points to use for lambda_z estimation. The function
#'   will automatically select the last `n_points` for regression. Default is 3.
#' @return A numeric value representing lambda_z. Returns NA if estimation fails or conditions are not met.
#' @examples
#' time <- c(0, 0.5, 1, 1.5, 2, 4, 6, 8, 10, 12, 24)
#' concentration <- c(0, 12, 25, 32, 28, 15, 9, 6, 4, 2, 0.5)
#' estimate_lambda_z(time, concentration)
#' estimate_lambda_z(time, concentration, n_points = 4)
#' @importFrom data.table data.table
#' @export
estimate_lambda_z <- function(time, concentration, n_points = 3) {
  if (!is.numeric(time) || !is.numeric(concentration)) {
    stop("Both 'time' and 'concentration' must be numeric vectors.")
  }
  if (length(time) != length(concentration)) {
    stop("'time' and 'concentration' vectors must be of the same length.")
  }
  if (any(time < 0)) {
    stop("'time' values must be non-negative.")
  }
  if (any(diff(time) < 0)) {
    stop("'time' vector must be sorted in ascending order.")
  }
  if (any(concentration <= 0)) {
    warning("Concentration values less than or equal to zero detected. These will be excluded for log-linear regression.")
    valid_indices <- which(concentration > 0)
    time <- time[valid_indices]
    concentration <- concentration[valid_indices]
  }
  if (length(time) < n_points) {
    warning(paste0("Not enough data points (", length(time), ") to estimate lambda_z with ", n_points, " points. Returning NA."))
    return(NA)
  }

  # Select the last n_points for regression
  n_total <- length(time)
  start_idx <- max(1, n_total - n_points + 1)

  terminal_time <- time[start_idx:n_total]
  terminal_concentration <- concentration[start_idx:n_total]

  if (length(terminal_time) < n_points) {
    warning("Insufficient valid data points in the terminal phase for lambda_z estimation. Returning NA.")
    return(NA)
  }

  # Perform log-linear regression
  log_concentration <- log(terminal_concentration)
  model <- lm(log_concentration ~ terminal_time)

  # lambda_z is the negative of the slope
  lambda_z_val <- -coef(model)[["terminal_time"]]

  # Ensure lambda_z is positive
  if (is.na(lambda_z_val) || lambda_z_val <= 0) {
    warning("Estimated lambda_z is not positive or is NA. Returning NA.")
    return(NA)
  }

  return(lambda_z_val)
}
