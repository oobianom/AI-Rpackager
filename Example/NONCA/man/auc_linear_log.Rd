% Generated from Roxygen: Do not edit by hand
\name{auc_linear_log}
\alias{auc_linear_log}
\title{Calculate Area Under the Curve (AUC) using Linear-Log Trapezoidal Rule}
\usage{
auc_linear_log(
  time,
  concentration,
  t_interval = NULL,
  c_extrap_rule = "linear",
  ...)
}
\description{
This function calculates the Area Under the Curve (AUC) using the linear-log trapezoidal rule.
It's suitable for situations where concentrations decline exponentially.
}
\details{
The function uses the linear trapezoidal rule for ascending concentrations and
the logarithmic trapezoidal rule for descending concentrations.
}
\arguments{
\item{time}{Numeric vector of time points.}
\item{concentration}{Numeric vector of drug concentrations corresponding to time points.}
\item{t_interval}{Optional numeric vector specifying time intervals for AUC calculation.
If NULL, intervals are determined from the unique sorted time points.}
\item{c_extrap_rule}{Character string indicating the extrapolation rule for AUC.
"linear" (default) or "log".}
\item{...}{Additional arguments to be passed to underlying functions (e.g., for error handling).}
}
\value{
A numeric value representing the calculated AUC.
}
\examples{
time <- c(0, 0.5, 1, 2, 4, 6, 8, 12, 24)
concentration <- c(0, 2.1, 4.5, 7.8, 6.2, 4.1, 2.5, 1.2, 0.3)
auc_linear_log(time, concentration)

time_sparse <- c(0, 1, 6, 24)
concentration_sparse <- c(0, 5, 3, 0.5)
auc_linear_log(time_sparse, concentration_sparse)
}
\seealso{
\code{\link{auc_inf}}
}