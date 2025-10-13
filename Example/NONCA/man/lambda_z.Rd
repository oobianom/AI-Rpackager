% Generated from Roxygen: Do not edit by hand
\name{lambda_z}
\alias{lambda_z}
\title{Estimate Terminal Elimination Rate Constant (lambda_z)}
\usage{
lambda_z(time, concentration, n_points = 3, exclude_last = 0)
}
\description{
This function estimates the terminal elimination rate constant (lambda_z)
from the terminal phase of the concentration-time curve using linear regression
on the natural logarithm of concentrations.
}
\details{
The function selects a specified number of terminal data points (typically 3 or more)
and performs a linear regression of log(concentration) versus time.
The absolute value of the slope from this regression is lambda_z.
It automatically attempts to find the best fit for the terminal phase.
}
\arguments{
\item{time}{Numeric vector of time points.}
\item{concentration}{Numeric vector of drug concentrations corresponding to time points.}
\item{n_points}{Integer specifying the minimum number of points to use for lambda_z estimation.
Defaults to 3.}
\item{exclude_last}{Integer specifying how many last points to exclude from the
regression. Useful if the very last points are unreliable. Defaults to 0.}
}
\value{
A numeric value representing the estimated lambda_z.
}
\examples{
time <- c(0, 0.5, 1, 2, 4, 6, 8, 12, 24, 36)
concentration <- c(0, 2.1, 4.5, 7.8, 6.2, 4.1, 2.5, 1.2, 0.3, 0.05)
lambda_z(time, concentration)

# Excluding the last point
lambda_z(time, concentration, exclude_last = 1)
}