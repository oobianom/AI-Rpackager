% Generated from Roxygen: Do not edit by hand
\name{volume_distribution}
\alias{volume_distribution}
\title{Calculate Volume of Distribution (Vd)}
\usage{
volume_distribution(dose, lambda_z, auc_inf)
}
\description{
This function calculates the volume of distribution (Vd) given the administered
dose, the terminal elimination rate constant (lambda_z), and AUC0-inf.
}
\details{
The volume of distribution is calculated using the formula: Vd = Dose / (lambda_z * AUC0-inf).
}
\arguments{
\item{dose}{Numeric value of the administered dose.}
\item{lambda_z}{Numeric value for the terminal elimination rate constant.}
\item{auc_inf}{Numeric value of the Area Under the Curve to Infinity (AUC0-inf).}
}
\value{
A numeric value representing the calculated volume of distribution.
}
\examples{
dose_value <- 100 # mg
lambda_z_value <- 0.1 # hr^-1
auc_inf_value <- 100 # mg*hr/L
volume_distribution(dose_value, lambda_z_value, auc_inf_value)

# Example with previously calculated parameters
time <- c(0, 0.5, 1, 2, 4, 6, 8, 12, 24)
concentration <- c(0, 2.1, 4.5, 7.8, 6.2, 4.1, 2.5, 1.2, 0.3)
estimated_lambda_z <- lambda_z(time, concentration)
calculated_auc_inf <- auc_inf(time, concentration)
volume_distribution(dose = 50, lambda_z = estimated_lambda_z, auc_inf = calculated_auc_inf)
}
\seealso{
\code{\link{lambda_z}}, \code{\link{auc_inf}}
}