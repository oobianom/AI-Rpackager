% Generated from Roxygen: Do not edit by hand
\name{cmax_tmax}
\alias{cmax_tmax}
\title{Determine Cmax and Tmax}
\usage{
cmax_tmax(time, concentration)
}
\description{
This function identifies the maximum observed concentration (Cmax) and the
time at which it occurred (Tmax) from pharmacokinetic data.
}
\arguments{
\item{time}{Numeric vector of time points.}
\item{concentration}{Numeric vector of drug concentrations corresponding to time points.}
}
\value{
A list containing:
\itemize{
\item{\code{Cmax}: The maximum observed concentration.}
\item{\code{Tmax}: The time point at which Cmax occurred. If Cmax occurs at multiple
time points, the first such time point is returned.}
}
}
\examples{
time <- c(0, 0.5, 1, 2, 4, 6, 8, 12, 24)
concentration <- c(0, 2.1, 4.5, 7.8, 6.2, 4.1, 2.5, 1.2, 0.3)
cmax_tmax(time, concentration)

time2 <- c(0, 1, 2, 3, 3, 4)
concentration2 <- c(0, 10, 15, 20, 20, 18)
cmax_tmax(time2, concentration2) # Demonstrates returning the first Tmax
}