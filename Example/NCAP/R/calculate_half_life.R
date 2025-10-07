
#' Calculate Half-Life (t1/2)
#'
#' This function calculates the terminal elimination half-life (t1/2) from plasma concentration-time data.
#' It requires the terminal elimination rate constant (Lambda_z).
#'
#' @param lambda_z A numeric value representing the terminal elimination rate constant (Lambda_z).
#' @return A numeric value representing the terminal elimination half-life (t1/2).
#' @export
#' @examples
#' # Example usage:
#' # Assuming Lambda_z is 0.1 per hour
#' calculate_half_life(lambda_z = 0.1)
calculate_half_life <- function(lambda_z) {
  if (missing(lambda_z) || !is.numeric(lambda_z) || length(lambda_z) != 1) {
    stop("lambda_z must be a single numeric value.")
  }
  if (lambda_z <= 0) {
    stop("lambda_z must be a positive value.")
  }

  t_half <- log(2) / lambda_z
  return(t_half)
}
