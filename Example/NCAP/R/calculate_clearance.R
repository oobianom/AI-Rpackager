
#' Calculate Clearance (CL)
#'
#' This function calculates the total body clearance (CL) from pharmacokinetic data.
#'
#' @param dose A numeric value representing the administered dose.
#' @param auc A numeric value representing the Area Under the Curve (AUC).
#'
#' @return A numeric value representing the calculated Clearance (CL).
#' @export
#'
#' @examples
#' # Example with a single dose and AUC
#' dose_val <- 100
#' auc_val <- 50
#' calculate_clearance(dose = dose_val, auc = auc_val)
#'
#' # Example with different values
#' dose_val_2 <- 200
#' auc_val_2 <- 75
#' calculate_clearance(dose = dose_val_2, auc = auc_val_2)
calculate_clearance <- function(dose, auc) {
  if (!is.numeric(dose) || length(dose) != 1 || dose <= 0) {
    stop("Dose must be a single positive numeric value.")
  }
  if (!is.numeric(auc) || length(auc) != 1 || auc <= 0) {
    stop("AUC must be a single positive numeric value.")
  }

  cl <- dose / auc
  return(cl)
}
