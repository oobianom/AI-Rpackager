#' Sample Pharmacokinetic Data
#'
#' A sample dataset for demonstrating non-compartmental analysis (NCA) functions.
#' It includes columns for Subject ID, Time, and Concentration.
#'
#' @format A data frame with 18 rows and 3 variables:
#' \describe{
#'   \item{Subject}{Identifier for each subject.}
#'   \item{Time}{Time points at which concentrations were measured (e.g., in hours).}
#'   \item{Concentration}{Drug concentration values (e.g., in ng/mL).}
#' }
#' @examples
#' data(sd_data)
#' \dontrun{
#' # This data would be used with NONCA functions, e.g.,
#' # auc_linear_log(Time = sd_data$Time, Concentration = sd_data$Concentration)
#' }
"sd_data"

# Example code to generate sd_data.rda (for package developer)
# sd_data <- data.frame(
#   Subject = rep(1, 18),
#   Time = c(0, 0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 12, 16, 24, 36, 48, 72, 96),
#   Concentration = c(0, 20.1, 40.2, 55.3, 60.4, 58.5, 50.6, 40.7, 30.8, 20.9, 15.0, 10.1, 7.2, 4.3, 2.4, 1.5, 0.6, 0.2)
# )
# usethis::use_data(sd_data, overwrite = TRUE)
