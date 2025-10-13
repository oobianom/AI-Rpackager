% Generated from Roxygen: Do not edit by hand
\name{accumulation_ratio}
\alias{accumulation_ratio}
\title{Calculate Accumulation Ratio (Rac)}
\usage{
accumulation_ratio(auc_tau_ss, auc_tau_1)
}
\description{
This function calculates the accumulation ratio (Rac) at steady state, which is
the ratio of AUC over a dosing interval at steady state to AUC over the first
dosing interval.
}
\arguments{
\item{auc_tau_ss}{Numeric value of AUC over a dosing interval at steady state.}
\item{auc_tau_1}{Numeric value of AUC over the first dosing interval.}
}
\value{
A numeric value representing the calculated accumulation ratio.
}
\examples{
# Assuming these values were previously calculated
auc_tau_ss_value <- 25 # mg*hr/L
auc_tau_1_value <- 10 # mg*hr/L
accumulation_ratio(auc_tau_ss_value, auc_tau_1_value)
}