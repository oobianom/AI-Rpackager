
#' @title Calculate Volume of Distribution (Vd)
#'
#' @description
#' This function calculates the apparent volume of distribution (Vd) from pharmacokinetic data.
#' Vd is a proportionality constant that relates the total amount of drug in the body to the concentration of drug in the blood or plasma.
#'
#' @param dose A numeric value representing the administered dose of the drug.
#' @param auc_inf A numeric value representing the Area Under the Curve extrapolated to infinity.
#' @param lambda_z A numeric value representing the terminal elimination rate constant (optional, for steady-state).
#' @param cl A numeric value representing the clearance (optional, for steady-state).
#' @return A numeric value representing the calculated Volume of Distribution (Vd).
#' @examples
#' # Example 1: Calculate Vd using Dose and AUC_inf
#' dose_val <- 100 # mg
#' auc_inf_val <- 50 # mg*hr/L
#' calculate_volume_of_distribution(dose = dose_val, auc_inf = auc_inf_val)
#'
#' # Example 2: Calculate Vd using Clearance and Lambda_z
#' cl_val <- 10 # L/hr
#' lambda_z_val <- 0.1 # 1/hr
#' calculate_volume_of_distribution(cl = cl_val, lambda_z = lambda_z_val)
#'
#' @export
calculate_volume_of_distribution <- function(dose = NULL, auc_inf = NULL, lambda_z = NULL, cl = NULL) {
  if (!is.null(dose) && !is.null(auc_inf)) {
    if (auc_inf <= 0) {
      stop("AUC_inf must be a positive value.")
    }
    vd <- dose / auc_inf
  } else if (!is.null(cl) && !is.null(lambda_z)) {
    if (lambda_z <= 0) {
      stop("Lambda_z must be a positive value.")
    }
    vd <- cl / lambda_z
  } else {
    stop("Insufficient parameters. Provide either 'dose' and 'auc_inf' OR 'cl' and 'lambda_z'.")
  }
  return(vd)
}
