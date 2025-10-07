
#' Calculate Area Under the Curve (AUC) using the linear trapezoidal rule
#'
#' This function calculates the Area Under the Curve (AUC) from time and concentration data
#' using the linear trapezoidal rule.
#'
#' @param time A numeric vector of time points.
#' @param concentration A numeric vector of drug concentrations corresponding to the time points.
#'
#' @return A numeric value representing the calculated AUC.
#' @export
#'
#' @examples
#' time <- c(0, 1, 2, 4, 6, 8, 12, 24)
#' concentration <- c(10, 8.5, 7.2, 5.5, 4.1, 3.0, 1.5, 0.5)
#' calculate_auc_linear(time, concentration)
calculate_auc_linear <- function(time, concentration) {
  if (length(time) != length(concentration)) {
    stop("Time and concentration vectors must have the same length.")
  }
  if (length(time) < 2) {
    return(0) # AUC is 0 if there's less than 2 points
  }

  auc <- 0
  for (i in 1:(length(time) - 1)) {
    # Linear trapezoidal rule
    auc <- auc + (concentration[i] + concentration[i+1]) / 2 * (time[i+1] - time[i])
  }
  return(auc)
}
