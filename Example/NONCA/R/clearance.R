
#' Calculate Clearance (CL).
#'
#' This function calculates clearance (CL) based on dose and AUC from time 0 to infinity.
#'
#' @param dose The administered dose of the drug. Must be a single positive numeric value.
#' @param auc_0_inf The Area Under the Curve from time 0 to infinity (AUC0-inf).
#'   Must be a single positive numeric value.
#' @return A numeric value representing clearance. Returns NA if inputs are invalid.
#' @examples
#' dose <- 100
#' auc_0_inf_val <- 250
#' clearance(dose, auc_0_inf_val)
#' @export
clearance <- function(dose, auc_0_inf) {
  if (!is.numeric(dose) || length(dose) != 1 || dose <= 0) {
    stop("'dose' must be a single positive numeric value.")
  }
  if (!is.numeric(auc_0_inf) || length(auc_0_inf) != 1 || auc_0_inf <= 0) {
    stop("'auc_0_inf' must be a single positive numeric value.")
  }
  return(dose / auc_0_inf)
}
