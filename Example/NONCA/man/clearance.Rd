% Generated from Roxygen: Do not edit by hand
\name{clearance}
\alias{clearance}
\title{Calculate Clearance (CL)}
\usage{
clearance(dose, auc_inf)
}
\description{
This function calculates the total body clearance (CL) given the administered
dose and the Area Under the Curve to Infinity (AUC0-inf).
}
\arguments{
\item{dose}{Numeric value of the administered dose.}
\item{auc_inf}{Numeric value of the Area Under the Curve to Infinity (AUC0-inf).}
}
\value{
A numeric value representing the calculated clearance.
}
\examples{
dose_value <- 100 # mg
auc_inf_value <- 20 # mg*hr/L
clearance(dose_value, auc_inf_value)

# Example with previously calculated AUC0-inf
time <- c(0, 0.5, 1, 2, 4, 6, 8, 12, 24)
concentration <- c(0, 2.1, 4.5, 7.8, 6.2, 4.1, 2.5, 1.2, 0.3)
calculated_auc_inf <- auc_inf(time, concentration)
clearance(dose = 50, auc_inf = calculated_auc_inf)
}
\seealso{
\code{\link{auc_inf}}
}