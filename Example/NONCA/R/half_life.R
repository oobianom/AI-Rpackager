
#' Calculate the half-life (t1/2).
#'
#' This function calculates the half-life (t1/2) based on the terminal
#' elimination rate constant (lambda_z).
#'
#' @param lambda_z The terminal elimination rate constant (lambda_z). Must be a positive numeric value.
#' @return A numeric value representing the half-life. Returns NA if lambda_z is invalid.
#' @examples
#' lambda_z <- 0.1
#' half_life(lambda_z)
#' @export
half_life <- function(lambda_z) {
  if (!is.numeric(lambda_z) || length(lambda_z) != 1 || lambda_z <= 0) {
    stop("'lambda_z' must be a single positive numeric value.")
  }
  return(log(2) / lambda_z)
}
