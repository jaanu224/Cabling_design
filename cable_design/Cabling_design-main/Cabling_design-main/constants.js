// Material constants for heating calculations
// Based on IEC 949 Table I: Material Constants
const MATERIAL_CONSTANTS = {
    aluminum: {
        K: 148, // Constant for adiabatic calculation (A/mm²·√s) - IEC 949 Table I
        beta: 228, // Temperature coefficient - IEC 949 Table I
        sigma1: 2.5e6, // Thermal conductivity factor (W/m·K) - IEC 949 Table I
        rho20: 2.8264e-8, // Resistivity at 20°C (Ω·m) - IEC 949 Table I
        F: 1.0, // Factor for non-adiabatic calculation (default, can be overridden)
        delta: 1.0, // Delta factor (default, can be overridden)
        sigma2: 0.5, // Thermal conductivity factor 2 (default, can be overridden)
        sigma3: 0.5, // Thermal conductivity factor 3 (default, can be overridden)
        name: "Aluminum"
    },
    copper: {
        K: 226, // Constant for adiabatic calculation (A/mm²·√s) - IEC 949 Table I
        beta: 234.5, // Temperature coefficient - IEC 949 Table I
        sigma1: 3.45e6, // Thermal conductivity factor (W/m·K) - IEC 949 Table I
        rho20: 1.7241e-8, // Resistivity at 20°C (Ω·m) - IEC 949 Table I
        F: 1.0, // Factor for non-adiabatic calculation (default, can be overridden)
        delta: 1.0, // Delta factor (default, can be overridden)
        sigma2: 0.5, // Thermal conductivity factor 2 (default, can be overridden)
        sigma3: 0.5, // Thermal conductivity factor 3 (default, can be overridden)
        name: "Copper"
    },
    lead: {
        K: 41, // Constant for adiabatic calculation (A/mm²·√s) - IEC 949 Table I
        beta: 230, // Temperature coefficient - IEC 949 Table I
        sigma1: 1.45e6, // Thermal conductivity factor (W/m·K) - IEC 949 Table I
        rho20: 21.4e-8, // Resistivity at 20°C (Ω·m) - IEC 949 Table I
        F: 1.0, // Factor for non-adiabatic calculation (default, can be overridden)
        delta: 1.0, // Delta factor (default, can be overridden)
        sigma2: 0.5, // Thermal conductivity factor 2 (default, can be overridden)
        sigma3: 0.5, // Thermal conductivity factor 3 (default, can be overridden)
        name: "Lead"
    },
    sheathLead: {
        K: 41,
        beta: 230,
        sigma1: 1.45e6,
        rho20: 21.4e-8,
        F: 1.0,
        delta: 1.0,
        sigma2: 0.5,
        sigma3: 0.5,
        name: "Lead Sheath"
    },
    sheathSteel: {
        K: 78,
        beta: 202,
        sigma1: 3.8e6,
        rho20: 13.8e-8,
        F: 1.0,
        delta: 1.0,
        sigma2: 0.5,
        sigma3: 0.5,
        name: "Steel Armour"
    },
    sheathBronze: {
        K: 180,
        beta: 313,
        sigma1: 3.4e6,
        rho20: 3.5e-8,
        F: 1.0,
        delta: 1.0,
        sigma2: 0.5,
        sigma3: 0.5,
        name: "Bronze Armour"
    },
    sheathAluminum: {
        K: 148,
        beta: 228,
        sigma1: 2.5e6,
        rho20: 2.84e-8,
        F: 1.0,
        delta: 1.0,
        sigma2: 0.5,
        sigma3: 0.5,
        name: "Aluminum Armour"
    }
};

// Default values
const DEFAULT_VALUES = {
    ambientTemp: 25, // °C
    initialTemp: 25, // °C
    finalTemp: 90, // °C (typical maximum operating temperature)
    F: 1.0, // Non-adiabatic factor F
    delta: 1.0, // Delta factor
    sigma1: 1.0,
    sigma2: 0.5,
    sigma3: 0.5
};

