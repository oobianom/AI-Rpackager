# NCAP: Non-Compartmental Analysis Package for Pharmacokinetics

## Introduction

The NCAP package provides a comprehensive set of functions for performing non-compartmental analysis (NCA) of pharmacokinetic (PK) data. It is designed to be user-friendly and robust, offering essential calculations for various PK parameters.

## Installation

```R
# Install the development version from GitHub (once available)
# devtools::install_github("your_github_username/NCAP")

# For now, manually add the R files to your R project and source them.
```

## Usage

Here's a quick overview of how to use the key functions in the NCAP package.

### Example Data

Let's assume you have a data frame like this:

```R
pk_data <- data.frame(
  Time = c(0, 0.25, 0.5, 1, 2, 4, 6, 8, 12, 24),
  Concentration = c(0, 1.2, 2.5, 3.8, 4.2, 3.1, 2.0, 1.1, 0.5, 0.1)
)
```

### 1. Calculate Area Under the Curve (AUC)

The `calculate_auc_linear` function calculates the AUC using the linear trapezoidal rule.

```R
auc_val <- calculate_auc_linear(time = pk_data$Time, concentration = pk_data$Concentration)
print(paste("AUC (0-t):", round(auc_val, 2)))
```

### 2. Calculate Cmax and Tmax

The `calculate_cmax_tmax` function determines the maximum concentration (Cmax) and the time at which it occurs (Tmax).

```R
cmax_tmax_results <- calculate_cmax_tmax(time = pk_data$Time, concentration = pk_data$Concentration)
print(paste("Cmax:", round(cmax_tmax_results$Cmax, 2)))
print(paste("Tmax:", round(cmax_tmax_results$Tmax, 2)))
```

### 3. Calculate Half-life (t1/2)

The `calculate_half_life` function estimates the elimination half-life. Note: This function requires identification of the elimination phase.

```R
# Example: Assuming last few points are in the elimination phase
# In a real scenario, you would perform a log-linear regression
# For demonstration, let's use a simplified approach
# (You might need to implement a more robust lambda_z estimation first)

# Example using a placeholder for lambda_z
lambda_z_estimate <- 0.15 # This should come from calculate_lambda_z
half_life_val <- calculate_half_life(lambda_z = lambda_z_estimate)
print(paste("Half-life:", round(half_life_val, 2)))
```

### 4. Calculate Clearance (CL)

The `calculate_clearance` function calculates clearance.

```R
dose_administered <- 100 # Example dose
cl_val <- calculate_clearance(dose = dose_administered, auc_inf = 35) # auc_inf needs to be estimated
print(paste("Clearance:", round(cl_val, 2)))
```

### 5. Calculate Volume of Distribution (Vd)

The `calculate_volume_of_distribution` function estimates the apparent volume of distribution.

```R
vd_val <- calculate_volume_of_distribution(dose = dose_administered, auc_inf = 35, lambda_z = lambda_z_estimate)
print(paste("Volume of Distribution:", round(vd_val, 2)))
```

### 6. Calculate Area Under the Moment Curve (AUMC)

The `calculate_aumc` function calculates the AUMC using the linear trapezoidal rule.

```R
aumc_val <- calculate_aumc(time = pk_data$Time, concentration = pk_data$Concentration)
print(paste("AUMC (0-t):", round(aumc_val, 2)))
```

### 7. Calculate Lambda_z (Terminal elimination rate constant)

The `calculate_lambda_z` function estimates the terminal elimination rate constant. This typically involves identifying the log-linear elimination phase.

```R
# Example: Using a subset of data points assumed to be in the elimination phase
# In a real application, you would need a more sophisticated method to select points
elimination_time <- c(6, 8, 12, 24)
elimination_concentration <- c(2.0, 1.1, 0.5, 0.1)

lambda_z_results <- calculate_lambda_z(
  time = elimination_time,
  concentration = elimination_concentration,
  end_points = 4 # Example, typically determined by visual inspection or R-squared
)
print(paste("Lambda_z:", round(lambda_z_results$lambda_z, 4)))
print(paste("R_squared_adj:", round(lambda_z_results$r_squared_adj, 3)))
```

## Contributing

(Details on how to contribute to the package will go here.)

## License

(Details about the package license will go here.)
