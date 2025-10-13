% Generated from Roxygen: Do not edit by hand
\name{auc_inf}
\alias{auc_inf}
\title{Calculate Area Under the Curve to Infinity (AUC0-inf)}
\usage{
auc_inf(
  time,
  concentration,
  lambda_z = NULL,
  t_last = NULL,
  auc_to_tlast = NULL,
  extrap_rule = "log",
  ...)
}
\description{
This function calculates the Area Under the Curve to Infinity (AUC0-inf)
by extrapolating the last observed concentration to infinity.
}
\details{
AUC0-inf is calculated as AUC to the last observed time point (AUC0-tlast) plus
the extrapolated AUC from t_last to infinity (C_last / lambda_z).
If \code{auc_to_tlast} is not provided, it will be calculated using \code{\link{auc_linear_log}}.
If \code{lambda_z} is not provided, it will be estimated using \code{\link{lambda_z}}.
}
\arguments{
\item{time}{Numeric vector of time points.}
\item{concentration}{Numeric vector of drug concentrations corresponding to time points.}
\item{lambda_z}{Optional numeric value for the terminal elimination rate constant.
If NULL, it will be estimated from the data.}
\item{t_last}{Optional numeric value for the last time point used for AUC calculation.
If NULL, the last observed time point with a non-zero concentration is used.}
\item{auc_to_tlast}{Optional numeric value for AUC from time 0 to t_last.
If NULL, it will be calculated internally.}
\item{extrap_rule}{Character string indicating the extrapolation rule for AUC.
"linear" or "log" (default).}
\item{...}{Additional arguments to be passed to underlying functions (e.g., \code{\link{lambda_z}}).}
}
\value{
A numeric value representing the calculated AUC0-inf.
}
\examples{
time <- c(0, 0.5, 1, 2, 4, 6, 8, 12, 24)
concentration <- c(0, 2.1, 4.5, 7.8, 6.2, 4.1, 2.5, 1.2, 0.3)
auc_inf(time, concentration)

# With pre-calculated lambda_z
lambda_z_val <- 0.1
auc_inf(time, concentration, lambda_z = lambda_z_val)
}
\seealso{
\code{\link{auc_linear_log}}, \code{\link{lambda_z}}
}