
#' Calculate Cmax and Tmax
#'
#' This function calculates the maximum observed concentration (Cmax) and the
#' time at which it occurs (Tmax) from pharmacokinetic data.
#'
#' @param time A numeric vector of time points.
#' @param concentration A numeric vector of drug concentrations corresponding to the `time` points.
#'
#' @return A list containing:
#'   \item{Cmax}{The maximum observed concentration.}
#'   \item{Tmax}{The time at which the maximum concentration was observed.}
#' @export
#'
#' @examples
#' time <- c(0, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 12, 24)
#' concentration <- c(0, 2.1, 4.5, 6.0, 5.5, 4.0, 2.5, 1.2, 0.6, 0.2, 0.05)
#' calculate_cmax_tmax(time, concentration)
calculate_cmax_tmax <- function(time, concentration) {
  if (length(time) != length(concentration)) {
    stop("Length of 'time' and 'concentration' vectors must be the same.")
  }
  if (!is.numeric(time) || !is.numeric(concentration)) {
    stop("'time' and 'concentration' must be numeric vectors.")
  }

  max_conc_index <- which.max(concentration)
  Cmax <- concentration[max_conc_index]
  Tmax <- time[max_conc_index]

  return(list(Cmax = Cmax, Tmax = Tmax))
}
