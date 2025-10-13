% Generated from Roxygen: Do not edit by hand
\name{bioavailability}
\alias{bioavailability}
\title{Calculate Absolute Bioavailability (F)}
\usage{
bioavailability(dose_iv, auc_inf_iv, dose_test, auc_inf_test)
}
\description{
This function calculates the absolute bioavailability (F) by comparing the
AUC from an extravascular (test) administration to an intravenous (IV) administration.
}
\details{
The formula used is F = (AUC_test * Dose_IV) / (AUC_IV * Dose_test).
}
\arguments{
\item{dose_iv}{Numeric value of the intravenous dose.}
\item{auc_inf_iv}{Numeric value of AUC0-inf from intravenous administration.}
\item{dose_test}{Numeric value of the test (extravascular) dose.}
\item{auc_inf_test}{Numeric value of AUC0-inf from test (extravascular) administration.}
}
\value{
A numeric value representing the calculated absolute bioavailability (F).
}
\examples{
dose_iv_val <- 50 # mg
auc_inf_iv_val <- 100 # mg*hr/L

dose_test_val <- 100 # mg
auc_inf_test_val <- 80 # mg*hr/L

bioavailability(dose_iv_val, auc_inf_iv_val, dose_test_val, auc_inf_test_val)
}