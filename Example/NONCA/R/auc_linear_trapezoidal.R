
#' Calculate Area Under the Curve (AUC) using the linear trapezoidal rule.
#'
#' This function calculates the Area Under the Curve (AUC) from time 0 to the
#' last observed time point (AUC0-t) using the linear trapezoidal rule.
#'
#' @param time A numeric vector of time points. Must be non-negative and sorted in ascending order.
#' @param concentration A numeric vector of drug concentrations corresponding to the `time` points.
#'   Must be of the same length as `time`.
#' @return A numeric value representing the AUC0-t.
#' @examples
#' time <- c(0, 0.5, 1, 1.5, 2, 4, 6, 8, 10, 12, 24)
#' concentration <- c(0, 12, 25, 32, 28, 15, 9, 6, 4, 2, 0.5)
#' auc_linear_trapezoidal(time, concentration)
#' @importFrom data.table data.table
#' @export
auc_linear_trapezoidal <- function(time, concentration) {
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
  if (length(time) < 2) {
    return(0) # AUC is 0 if fewer than 2 points
  }

  dt <- data.table(time = time, concentration = concentration)
  auc <- sum(0.5 * (dt$concentration[-length(dt$concentration)] + dt$concentration[-1]) * diff(dt$time))
  return(auc)
}
