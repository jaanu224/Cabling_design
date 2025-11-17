// Heating calculation functions based on standard formulas
// Step A: Adiabatic Current or Area
// Step B: Non-Adiabatic Factor (ε)
// Step C: Final Permissible Current or Area

/**
 * Step A: Calculate Adiabatic Current (I_AD)
 * Formula: I_AD = K · S · √(ln((θ_f + β)/(θ_i + β))/t)
 * @param {number} K - Material constant
 * @param {number} S - Cross-sectional area in mm²
 * @param {number} theta_f - Final temperature in °C
 * @param {number} theta_i - Initial temperature in °C
 * @param {number} beta - Temperature coefficient
 * @param {number} t - Time in seconds
 * @returns {number} Adiabatic current in Amperes
 */
function calculateAdiabaticCurrent(K, S, theta_f, theta_i, beta, t) {
    const numerator = theta_f + beta;
    const denominator = theta_i + beta;
    const logTerm = Math.log(numerator / denominator);
    const sqrtTerm = Math.sqrt(logTerm / t);
    return K * S * sqrtTerm;
}

/**
 * Step A: Calculate Adiabatic Area (S_AD)
 * Formula: S = (I · √t)/(K · √(ln((θ_f + β)/(θ_i + β))))
 * @param {number} I - Current in Amperes
 * @param {number} K - Material constant
 * @param {number} theta_f - Final temperature in °C
 * @param {number} theta_i - Initial temperature in °C
 * @param {number} beta - Temperature coefficient
 * @param {number} t - Time in seconds
 * @returns {number} Adiabatic area in mm²
 */
function calculateAdiabaticArea(I, K, theta_f, theta_i, beta, t) {
    const numerator = theta_f + beta;
    const denominator = theta_i + beta;
    const logTerm = Math.log(numerator / denominator);
    const sqrtLogTerm = Math.sqrt(logTerm);
    const sqrtT = Math.sqrt(t);
    return (I * sqrtT) / (K * sqrtLogTerm);
}

/**
 * Step B: Calculate Non-Adiabatic Factor M
 * Formula: M = (F/(δ · 10⁻³)) · ((σ₂ + σ₃)/σ₁)
 * @param {number} F - Factor F
 * @param {number} delta - Delta factor
 * @param {number} sigma1 - Sigma 1
 * @param {number} sigma2 - Sigma 2
 * @param {number} sigma3 - Sigma 3
 * @returns {number} Non-adiabatic factor M
 */
function calculateFactorM(F, delta, sigma1, sigma2, sigma3) {
    const firstTerm = F / (delta * 1e-3);
    const secondTerm = (sigma2 + sigma3) / sigma1;
    return firstTerm * secondTerm;
}

/**
 * Step B: Calculate Non-Adiabatic Factor ε
 * Formula: ε = 1 + 0.61 M√t - 0.069 (M√t)² + 0.0043 (M√t)³
 * @param {number} M - Factor M
 * @param {number} t - Time in seconds
 * @returns {number} Non-adiabatic factor ε
 */
function calculateEpsilon(M, t) {
    const MsqrtT = M * Math.sqrt(t);
    const term1 = 0.61 * MsqrtT;
    const term2 = 0.069 * Math.pow(MsqrtT, 2);
    const term3 = 0.0043 * Math.pow(MsqrtT, 3);
    return 1 + term1 - term2 + term3;
}

/**
 * Step C: Calculate Final Permissible Current (I_perm)
 * Formula: I_perm = ε · I_AD
 * @param {number} epsilon - Non-adiabatic factor ε
 * @param {number} I_AD - Adiabatic current in Amperes
 * @returns {number} Permissible current in Amperes
 */
function calculatePermissibleCurrent(epsilon, I_AD) {
    return epsilon * I_AD;
}

/**
 * Step C: Calculate Non-Adiabatic Area (S_non)
 * Formula: S_non = S_AD / ε
 * @param {number} S_AD - Adiabatic area in mm²
 * @param {number} epsilon - Non-adiabatic factor ε
 * @returns {number} Non-adiabatic area in mm²
 */
function calculateNonAdiabaticArea(S_AD, epsilon) {
    return S_AD / epsilon;
}

/**
 * Main calculation function for adiabatic heating
 * Supports both current and area calculations
 */
function calculateAdiabatic(params) {
    const { 
        calculationMode, // 'current' or 'area'
        current, 
        area, 
        time, 
        initialTemp, 
        finalTemp, 
        materialConstants 
    } = params;
    
    const K = materialConstants.K;
    const beta = materialConstants.beta;
    const theta_i = initialTemp;
    const theta_f = finalTemp;
    const t = time;
    
    let I_AD, S_AD;
    
    if (calculationMode === 'current') {
        // Calculate adiabatic current given area
        S_AD = area;
        I_AD = calculateAdiabaticCurrent(K, S_AD, theta_f, theta_i, beta, t);
    } else {
        // Calculate adiabatic area given current
        I_AD = current;
        S_AD = calculateAdiabaticArea(I_AD, K, theta_f, theta_i, beta, t);
    }
    
    return {
        I_AD: I_AD,
        S_AD: S_AD,
        K: K,
        beta: beta
    };
}

/**
 * Main calculation function for non-adiabatic heating
 * Calculates the non-adiabatic factor and final permissible values
 */
function calculateNonAdiabatic(params) {
    const {
        calculationMode,
        current,
        area,
        time,
        initialTemp,
        finalTemp,
        materialConstants,
        F,
        delta,
        sigma1,
        sigma2,
        sigma3
    } = params;
    
    // First calculate adiabatic values
    const adiabaticResults = calculateAdiabatic(params);
    
    // Step B: Calculate non-adiabatic factor ε
    const M = calculateFactorM(F, delta, sigma1, sigma2, sigma3);
    const epsilon = calculateEpsilon(M, time);
    
    // Step C: Calculate final permissible values
    let I_perm, S_non;
    
    if (calculationMode === 'current') {
        // Calculate permissible current
        I_perm = calculatePermissibleCurrent(epsilon, adiabaticResults.I_AD);
        S_non = adiabaticResults.S_AD; // Area remains the same
    } else {
        // Calculate non-adiabatic area
        S_non = calculateNonAdiabaticArea(adiabaticResults.S_AD, epsilon);
        I_perm = current; // Current remains the same
    }
    
    return {
        I_AD: adiabaticResults.I_AD,
        S_AD: adiabaticResults.S_AD,
        M: M,
        epsilon: epsilon,
        I_perm: I_perm,
        S_non: S_non
    };
}
