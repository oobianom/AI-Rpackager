
#' Calculate Maximum Concentration (Cmax) and Time to Cmax (Tmax).
#'
#' This function identifies the maximum observed concentration (Cmax) and
#' the time at which it occurs (Tmax) from pharmacokinetic data.
#'
#' @param time A numeric vector of time points. Must be non-negative and sorted in ascending order.
#' @param concentration A numeric vector of drug concentrations corresponding to the `time` points.
#'   Must be of the same length as `time`.
#' @return A list containing:
#'   \item{Cmax}{The maximum observed concentration.}
#'   \item{Tmax}{The time at which the maximum concentration was observed.}
#' @examples
#' time <- c(0, 0.5, 1, 1.5, 2, 4, 6, 8, 10, 12, 24)
#' concentration <- c(0, 12, 25, 32, 28, 15, 9, 6, 4, 2, 0.5)
#' cmax_tmax(time, concentration)
#' @importFrom data.table data.table
#' @export
cmax_tmax <- function(time, concentration) {
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
  if (length(time) == 0) {
    return(list(Cmax = NA, Tmax = NA))
  }

  max_idx <- which.max(concentration)
  Cmax_val <- concentration[max_idx]
  Tmax_val <- time[max_idx]

  return(list(Cmax = Cmax_val, Tmax = Tmax_val))
}
