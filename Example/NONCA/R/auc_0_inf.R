
#' Calculate Area Under the Curve from time 0 to infinity (AUC0-inf).
#'
#' This function calculates the Area Under the Curve from time 0 to infinity (AUC0-inf)
#' by combining AUC0-t (calculated using a specified method) and extrapolation from the
#' last observed time point to infinity using the terminal elimination rate constant (lambda_z).
#'
#' @param time A numeric vector of time points. Must be non-negative and sorted in ascending order.
#' @param concentration A numeric vector of drug concentrations corresponding to the `time` points.
#'   Must be of the same length as `time`. Concentrations must be non-negative.
#' @param lambda_z The terminal elimination rate constant (lambda_z). This can be calculated
#'   using the `estimate_lambda_z` function.
#' @param auc_method The method to use for calculating AUC0-t. Options are "linear" (default)
#'   for linear trapezoidal rule, or "loglinear" for log-linear trapezoidal rule.
#' @return A numeric value representing the AUC0-inf.
#' @examples
#' time <- c(0, 0.5, 1, 1.5, 2, 4, 6, 8, 10, 12, 24)
#' concentration <- c(0, 12, 25, 32, 28, 15, 9, 6, 4, 2, 0.5)
#' # Assuming lambda_z is pre-calculated or estimated
#' lambda_z_est <- 0.1 # Example value
#' auc_0_inf(time, concentration, lambda_z = lambda_z_est)
#' auc_0_inf(time, concentration, lambda_z = lambda_z_est, auc_method = "loglinear")
#' @importFrom data.table data.table
#' @export
auc_0_inf <- function(time, concentration, lambda_z, auc_method = "linear") {
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
  if (any(concentration < 0)) {
    stop("'concentration' values must be non-negative.")
  }
  if (!is.numeric(lambda_z) || length(lambda_z) != 1 || lambda_z <= 0) {
    stop("'lambda_z' must be a single positive numeric value.")
  }
  if (!auc_method %in% c("linear", "loglinear")) {
    stop("'auc_method' must be either 'linear' or 'loglinear'.")
  }
  if (length(time) < 2) {
    stop("At least two time-concentration points are required to calculate AUC.")
  }

  auc_0_t <- if (auc_method == "linear") {
    auc_linear_trapezoidal(time, concentration)
  } else {
    auc_loglinear_trapezoidal(time, concentration)
  }

  clast <- concentration[length(concentration)]
  tlast <- time[length(time)]

  # Handle cases where clast is zero, which would lead to division by zero or NaN in extrapolation
  if (clast == 0) {
    warning("Last observed concentration (C_last) is zero. AUC0-inf will be equal to AUC0-t.")
    auc_inf_extrap <- 0
  } else {
    auc_inf_extrap <- clast / lambda_z
  }

  auc_total <- auc_0_t + auc_inf_extrap
  return(auc_total)
}
