
#' Calculate Volume of Distribution (Vz).
#'
#' This function calculates the apparent volume of distribution during the terminal phase (Vz)
#' based on clearance and lambda_z.
#'
#' @param clearance The clearance (CL). Must be a single positive numeric value.
#' @param lambda_z The terminal elimination rate constant (lambda_z). Must be a single positive numeric value.
#' @return A numeric value representing the volume of distribution. Returns NA if inputs are invalid.
#' @examples
#' clearance_val <- 0.4
#' lambda_z_val <- 0.1
#' volume_of_distribution(clearance_val, lambda_z_val)
#' @export
volume_of_distribution <- function(clearance, lambda_z) {
  if (!is.numeric(clearance) || length(clearance) != 1 || clearance <= 0) {
    stop("'clearance' must be a single positive numeric value.")
  }
  if (!is.numeric(lambda_z) || length(lambda_z) != 1 || lambda_z <= 0) {
    stop("'lambda_z' must be a single positive numeric value.")
  }
  return(clearance / lambda_z)
}
