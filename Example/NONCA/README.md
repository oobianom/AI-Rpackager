# NONCA: Non-Compartmental Analysis Package

## Introduction
The `NONCA` package provides a comprehensive suite of functions for non-compartmental analysis (NCA) of pharmacokinetic (PK) data. It is designed to facilitate the estimation of key PK parameters from concentration-time data, offering robust and flexible tools for researchers and scientists in pharmacology, toxicology, and related fields.

## Installation
You can install the development version of `NONCA` from GitHub using `devtools`:

```R
# Install devtools if you haven't already
if (!requireNamespace("devtools", quietly = TRUE)) {
  install.packages("devtools")
}

devtools::install_github("your_github_username/NONCA")
```

## Quick Start Example
Here's a quick example of how to use the `NONCA` package to calculate AUC from a sample dataset:

```R
# Load the package
library(NONCA)

# Example data (replace with your actual data)
time <- c(0, 0.25, 0.5, 1, 2, 4, 6, 8, 12, 24)
concentration <- c(0, 10, 25, 40, 35, 20, 10, 5, 2, 0.5)

# Calculate AUC from 0 to the last observed time point using linear trapezoidal rule
auc_linear <- calculate_auc_linear(time, concentration)
print(paste("AUC (linear trapezoidal):", auc_linear))

# Calculate Cmax and Tmax
cmax_tmax <- calculate_cmax_tmax(time, concentration)
print(paste("Cmax:", cmax_tmax$Cmax, "Tmax:", cmax_tmax$Tmax))
```

## Features Overview
The `NONCA` package includes functions for:
*   **AUC Calculations:** Linear/log-linear trapezoidal rule (AUC0-t), AUC0-infinity.
*   **Cmax and Tmax:** Maximum observed concentration and time of maximum concentration.
*   **Lambda_z Estimation:** Estimation of the terminal elimination rate constant.
*   **Half-life:** Calculation of terminal elimination half-life.
*   **Clearance:** Estimation of systemic clearance.
*   **Volume of Distribution:** Estimation of apparent volume of distribution.
*   **MRT:** Mean Residence Time.
*   **Accumulation Ratio:** Assessment of drug accumulation.
*   **Bioavailability:** Estimation of absolute or relative bioavailability.

## Usage Examples
(Detailed usage examples will be provided in the package vignettes and function documentation.)

## Data Format Requirements
Functions in `NONCA` generally expect two primary numeric vectors: `time` and `concentration`. Ensure your data is ordered by time. Additional parameters may be required for specific functions (e.g., dose for clearance calculations).

## Citation Information
If you use `NONCA` in your research, please cite it as:

```
[Your Name(s)] (YYYY). NONCA: An R Package for Non-Compartmental Analysis. R package version X.X.X.
```
(More detailed citation information will be added upon formal publication or release.)
