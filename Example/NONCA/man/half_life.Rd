% Generated from Roxygen: Do not edit by hand
\name{half_life}
\alias{half_life}
\title{Calculate Half-Life (t1/2)}
\usage{
half_life(lambda_z)
}
\description{
This function calculates the terminal elimination half-life (t1/2) given the
terminal elimination rate constant (lambda_z).
}
\arguments{
\item{lambda_z}{Numeric value for the terminal elimination rate constant.}
}
\value{
A numeric value representing the calculated half-life.
}
\examples{
# Assuming lambda_z was calculated as 0.15 hr^-1
lambda_z_val <- 0.15
half_life(lambda_z_val)

# If lambda_z is from the lambda_z function
time <- c(0, 0.5, 1, 2, 4, 6, 8, 12, 24, 36)
concentration <- c(0, 2.1, 4.5, 7.8, 6.2, 4.1, 2.5, 1.2, 0.3, 0.05)
estimated_lambda_z <- lambda_z(time, concentration)
half_life(estimated_lambda_z)
}
\seealso{
\code{\link{lambda_z}}
}