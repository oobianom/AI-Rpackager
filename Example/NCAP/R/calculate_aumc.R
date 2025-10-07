
#' Calculate Area Under the Moment Curve (AUMC)
#'
#' This function calculates the Area Under the Moment Curve (AUMC) using the linear trapezoidal rule.
#' AUMC is a measure used in pharmacokinetics to quantify the total drug exposure over time,
#' weighted by time.
#'
#' @param time A numeric vector of time points.
#' @param concentration A numeric vector of drug concentrations corresponding to the time points.
#' @return A numeric value representing the AUMC.
#' @examples
#' time <- c(0, 0.5, 1, 2, 4, 6, 8, 12, 24)
#' concentration <- c(0, 2.1, 4.5, 7.8, 8.2, 6.1, 3.5, 1.2, 0.3)
#' calculate_aumc(time, concentration)
#'
#' time2 <- c(0, 1, 2, 3, 4)
#' concentration2 <- c(0, 10, 20, 15, 5)
#' calculate_aumc(time2, concentration2)
#' @export
calculate_aumc <- function(time, concentration) {
  if (length(time) != length(concentration)) {
    stop("Time and concentration vectors must have the same length.")
  }
  if (length(time) < 2) {
    return(0) # AUMC is 0 if there are less than 2 data points
  }

  aumc_val <- 0
  for (i in 1:(length(time) - 1)) {
    delta_t <- time[i+1] - time[i]
    aumc_val <- aumc_val + (time[i] * concentration[i] + time[i+1] * concentration[i+1]) * delta_t / 2
  }
  return(aumc_val)
}
