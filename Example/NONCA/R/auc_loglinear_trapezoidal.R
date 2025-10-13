
#' Calculate Area Under the Curve (AUC) using the log-linear trapezoidal rule.
#'
#' This function calculates the Area Under the Curve (AUC) from time 0 to the
#' last observed time point (AUC0-t) using the log-linear trapezoidal rule for
#' decreasing concentrations and linear for increasing concentrations or when
#' concentration is zero.
#'
#' @param time A numeric vector of time points. Must be non-negative and sorted in ascending order.
#' @param concentration A numeric vector of drug concentrations corresponding to the `time` points.
#'   Must be of the same length as `time`. Concentrations must be non-negative.
#' @return A numeric value representing the AUC0-t.
#' @examples
#' time <- c(0, 0.5, 1, 1.5, 2, 4, 6, 8, 10, 12, 24)
#' concentration <- c(0, 12, 25, 32, 28, 15, 9, 6, 4, 2, 0.5)
#' auc_loglinear_trapezoidal(time, concentration)
#' @importFrom data.table data.table
#' @export
auc_loglinear_trapezoidal <- function(time, concentration) {
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
  if (length(time) < 2) {
    return(0) # AUC is 0 if fewer than 2 points
  }

  dt <- data.table(time = time, concentration = concentration)
  auc_val <- 0

  for (i in 1:(nrow(dt) - 1)) {
    t1 <- dt$time[i]
    t2 <- dt$time[i+1]
    c1 <- dt$concentration[i]
    c2 <- dt$concentration[i+1]

    if (c1 == 0 && c2 == 0) {
      segment_auc <- 0
    } else if (c1 == 0 || c2 == 0 || c1 == c2) {
      segment_auc <- 0.5 * (c1 + c2) * (t2 - t1) # Linear trapezoidal
    } else { # Log-linear trapezoidal
      segment_auc <- (c2 - c1) / (log(c2) - log(c1)) * (t2 - t1)
    }
    auc_val <- auc_val + segment_auc
  }
  return(auc_val)
}
