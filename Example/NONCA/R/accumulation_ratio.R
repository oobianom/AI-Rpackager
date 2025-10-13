
#' Calculate Accumulation Ratio (Rac).
#'
#' This function calculates the accumulation ratio (Rac) for multiple dosing regimens.
#'
#' @param auc_tau_ss The AUC over a dosing interval at steady state (AUCtau,ss).
#'   Must be a single positive numeric value.
#' @param auc_tau_1 The AUC over the first dosing interval (AUCtau,1).
#'   Must be a single positive numeric value.
#' @return A numeric value representing the accumulation ratio. Returns NA if inputs are invalid.
#' @examples
#' auc_tau_ss_val <- 100
#' auc_tau_1_val <- 50
#' accumulation_ratio(auc_tau_ss_val, auc_tau_1_val)
#' @export
accumulation_ratio <- function(auc_tau_ss, auc_tau_1) {
  if (!is.numeric(auc_tau_ss) || length(auc_tau_ss) != 1 || auc_tau_ss <= 0) {
    stop("'auc_tau_ss' must be a single positive numeric value.")
  }
  if (!is.numeric(auc_tau_1) || length(auc_tau_1) != 1 || auc_tau_1 <= 0) {
    stop("'auc_tau_1' must be a single positive numeric value.")
  }
  return(auc_tau_ss / auc_tau_1)
}
