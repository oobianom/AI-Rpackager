
#' Calculate Absolute Bioavailability (F).
#'
#' This function calculates the absolute bioavailability (F) by comparing the AUC
#' of an extravascular dose to the AUC of an intravenous dose, adjusted for dose.
#'
#' @param auc_extravascular The AUC for the extravascular administration. Must be a single positive numeric value.
#' @param dose_extravascular The dose administered extravascularly. Must be a single positive numeric value.
#' @param auc_intravenous The AUC for the intravenous administration. Must be a single positive numeric value.
#' @param dose_intravenous The dose administered intravenously. Must be a single positive numeric value.
#' @return A numeric value representing the absolute bioavailability (F). Returns NA if inputs are invalid.
#' @examples
#' auc_extravascular_val <- 200
#' dose_extravascular_val <- 100
#' auc_intravenous_val <- 250
#' dose_intravenous_val <- 80
#' bioavailability(auc_extravascular_val, dose_extravascular_val,
#'                 auc_intravenous_val, dose_intravenous_val)
#' @export
bioavailability <- function(auc_extravascular, dose_extravascular,
                              auc_intravenous, dose_intravenous) {
  if (!is.numeric(auc_extravascular) || length(auc_extravascular) != 1 || auc_extravascular <= 0) {
    stop("'auc_extravascular' must be a single positive numeric value.")
  }
  if (!is.numeric(dose_extravascular) || length(dose_extravascular) != 1 || dose_extravascular <= 0) {
    stop("'dose_extravascular' must be a single positive numeric value.")
  }
  if (!is.numeric(auc_intravenous) || length(auc_intravenous) != 1 || auc_intravenous <= 0) {
    stop("'auc_intravenous' must be a single positive numeric value.")
  }
  if (!is.numeric(dose_intravenous) || length(dose_intravenous) != 1 || dose_intravenous <= 0) {
    stop("'dose_intravenous' must be a single positive numeric value.")
  }

  F_val <- (auc_extravascular * dose_intravenous) / (auc_intravenous * dose_extravascular)
  return(F_val)
}
