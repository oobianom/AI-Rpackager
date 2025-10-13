% Generated from Roxygen: Do not edit by hand
\name{mrt}
\alias{mrt}
\title{Calculate Mean Residence Time (MRT)}
\usage{
mrt(aumc_inf, auc_inf)
}
\description{
This function calculates the Mean Residence Time (MRT) given the Area Under the
Moment Curve to Infinity (AUMC0-inf) and AUC0-inf.
}
\details{
MRT is calculated as AUMC0-inf / AUC0-inf.
Note: AUMC0-inf calculation is not directly provided as a standalone function in this package
but would typically be calculated similarly to AUC, with concentration * time as the y-axis.
For this function, AUMC0-inf is expected as an input.
}
\arguments{
\item{aumc_inf}{Numeric value of the Area Under the Moment Curve to Infinity (AUMC0-inf).}
\item{auc_inf}{Numeric value of the Area Under the Curve to Infinity (AUC0-inf).}
}
\value{
A numeric value representing the calculated Mean Residence Time.
}
\examples{
# Assuming these values were previously calculated
aumc_inf_value <- 400 # mg*hr^2/L
auc_inf_value <- 100 # mg*hr/L
mrt(aumc_inf_value, auc_inf_value)
}
\seealso{
\code{\link{auc_inf}}
}