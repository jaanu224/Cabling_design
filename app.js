// Main application logic

// Global variable to store calculation results for export
let currentCalculationData = null;

// Standard conductor areas (mm²) for suggestion lookup
const STANDARD_CONDUCTOR_AREAS = [
    50, 70, 95, 120, 150, 185, 240, 300, 400, 500, 630,
    800, 1000, 1200, 1500, 1800, 2000, 2500, 3000
];

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    // Page navigation
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetPage = this.getAttribute('data-page');
            
            // Update active nav link
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show target page
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(targetPage).classList.add('active');
            updatePageTheme(targetPage);
            
            // Close mobile menu
            navMenu.classList.remove('active');
            
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    // Hamburger menu toggle
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Contact form handler
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('contactName').value;
            const email = document.getElementById('contactEmail').value;
            const subject = document.getElementById('contactSubject').value;
            const message = document.getElementById('contactMessage').value;
            
            // Show success message
            alert(`Thank you, ${name}! Your message has been sent. We'll get back to you at ${email} soon.`);
            contactForm.reset();
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // Set initial theme
    updatePageTheme('home');
});

// Initialize form handlers after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeFormHandlers();
});

function updatePageTheme(page) {
    const themeClasses = ['page-home', 'page-contact', 'page-insights'];
    document.body.classList.remove(...themeClasses);
    const themeClass = page === 'home'
        ? 'page-home'
        : page === 'contact'
            ? 'page-contact'
            : 'page-insights';
    document.body.classList.add(themeClass);
}

function initializeFormHandlers() {
    // Show/hide conductor type dropdown based on material type selection
    const materialTypeSelect = document.getElementById('materialType');
    if (materialTypeSelect) {
        materialTypeSelect.addEventListener('change', function() {
    const conductorTypeGroup = document.getElementById('conductorTypeGroup');
    const conductorType = document.getElementById('conductorType');
    
            if (this.value === 'conductor') {
                conductorTypeGroup.style.display = 'block';
                conductorType.required = true;
            } else {
                conductorTypeGroup.style.display = 'none';
                conductorType.required = false;
                conductorType.value = '';
            }
        });
    }

    // Show/hide inputs based on calculation mode
    const calculationModeSelect = document.getElementById('calculationMode');
    if (calculationModeSelect) {
        calculationModeSelect.addEventListener('change', function() {
    const currentGroup = document.getElementById('currentGroup');
    const areaGroup = document.getElementById('areaGroup');
    const currentInput = document.getElementById('current');
    const areaInput = document.getElementById('crossSection');
    
            if (this.value === 'current') {
                // Calculate current - need area
                areaGroup.style.display = 'block';
                currentGroup.style.display = 'none';
                areaInput.required = true;
                currentInput.required = false;
                currentInput.value = '';
            } else if (this.value === 'area') {
                // Calculate area - need current
                currentGroup.style.display = 'block';
                areaGroup.style.display = 'none';
                currentInput.required = true;
                areaInput.required = false;
                areaInput.value = '';
            } else {
                currentGroup.style.display = 'block';
                areaGroup.style.display = 'block';
                currentInput.required = false;
                areaInput.required = false;
            }
        });
    }

    // Show/hide non-adiabatic parameters
    const nonAdiabaticCheckbox = document.getElementById('calculateNonAdiabatic');
    if (nonAdiabaticCheckbox) {
        nonAdiabaticCheckbox.addEventListener('change', function() {
            const nonAdiabaticParams = document.getElementById('nonAdiabaticParams');
            if (this.checked) {
                nonAdiabaticParams.style.display = 'block';
            } else {
                nonAdiabaticParams.style.display = 'none';
            }
        });
    }

    // Form submission handler
    const heatingForm = document.getElementById('heatingForm');
    if (heatingForm) {
        heatingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const materialType = document.getElementById('materialType').value;
            const conductorType = document.getElementById('conductorType').value;
            const calculationMode = document.getElementById('calculationMode').value;
            const current = parseFloat(document.getElementById('current').value);
            const area = parseFloat(document.getElementById('crossSection').value);
            const time = parseFloat(document.getElementById('time').value);
            const initialTemp = parseFloat(document.getElementById('initialTemp').value) || DEFAULT_VALUES.initialTemp;
            const finalTemp = parseFloat(document.getElementById('finalTemp').value) || DEFAULT_VALUES.finalTemp;
            const calculateNonAdiabatic = document.getElementById('calculateNonAdiabatic').checked;
            
            // Get non-adiabatic parameters (use material defaults if not provided)
            const F = parseFloat(document.getElementById('F').value);
            const delta = parseFloat(document.getElementById('delta').value);
            const sigma1 = parseFloat(document.getElementById('sigma1').value);
            const sigma2 = parseFloat(document.getElementById('sigma2').value);
            const sigma3 = parseFloat(document.getElementById('sigma3').value);
            
            // Validate calculation mode
            if (!calculationMode) {
                alert('Please select a calculation mode.');
                return;
            }
            
            // Validate inputs based on calculation mode
            if (calculationMode === 'current' && (!area || isNaN(area))) {
                alert('Please enter cross-sectional area for current calculation.');
                return;
            }
            
            if (calculationMode === 'area' && (!current || isNaN(current))) {
                alert('Please enter current for area calculation.');
                return;
            }
            
            // Determine material constants
            let materialConstants;
            let materialName;
            
            if (materialType === 'sheath') {
                materialConstants = MATERIAL_CONSTANTS.sheath;
                materialName = 'Sheath';
            } else if (materialType === 'conductor') {
                if (conductorType === 'aluminum') {
                    materialConstants = MATERIAL_CONSTANTS.aluminum;
                    materialName = 'Aluminum Conductor';
                } else if (conductorType === 'copper') {
                    materialConstants = MATERIAL_CONSTANTS.copper;
                    materialName = 'Copper Conductor';
                } else {
                    alert('Please select a conductor material type.');
                    return;
                }
            } else {
                alert('Please select a material type.');
                return;
            }
            
            // Use material defaults for non-adiabatic parameters if not provided
            const finalF = isNaN(F) ? materialConstants.F : F;
            const finalDelta = isNaN(delta) ? materialConstants.delta : delta;
            const finalSigma1 = isNaN(sigma1) ? materialConstants.sigma1 : sigma1;
            const finalSigma2 = isNaN(sigma2) ? materialConstants.sigma2 : sigma2;
            const finalSigma3 = isNaN(sigma3) ? materialConstants.sigma3 : sigma3;
            
            // Prepare calculation parameters
            const params = {
                calculationMode,
                current: calculationMode === 'area' ? current : null,
                area: calculationMode === 'current' ? area : null,
                time,
                initialTemp,
                finalTemp,
                materialConstants,
                F: finalF,
                delta: finalDelta,
                sigma1: finalSigma1,
                sigma2: finalSigma2,
                sigma3: finalSigma3
            };
            
            // Perform calculations
            const adiabaticResults = calculateAdiabatic(params);
            
            let nonAdiabaticResults = null;
            if (calculateNonAdiabatic) {
                nonAdiabaticResults = calculateNonAdiabatic(params);
            }
            
            // Store calculation data for export
            currentCalculationData = {
                materialName,
                materialConstants,
                adiabaticResults,
                nonAdiabaticResults,
                calculationMode,
                inputParams: {
                    materialType,
                    conductorType,
                    current: calculationMode === 'area' ? current : null,
                    area: calculationMode === 'current' ? area : null,
                    time,
                    initialTemp,
                    finalTemp,
                    calculateNonAdiabatic
                }
            };
            
            // Display results
            displayResults(materialName, materialConstants, adiabaticResults, nonAdiabaticResults, calculationMode, params);
        });
    }
}

/**
 * Display calculation results
 * All values shown are CALCULATED using the formulas, not constants
 */
function displayResults(materialName, materialConstants, adiabaticResults, nonAdiabaticResults, calculationMode, params) {
    const resultsCard = document.getElementById('results');
    const materialInfo = document.getElementById('materialInfo');
    
    // Display material information (these are input constants from IEC 949, used in calculations)
    materialInfo.innerHTML = `
        <h3>Material: ${materialName}</h3>
        <p><strong>Material Constant K (IEC 949):</strong> ${materialConstants.K} A/mm²·√s</p>
        <p><strong>Material Constant β (IEC 949):</strong> ${materialConstants.beta}</p>
        <p><strong>Material Constant σ₁ (IEC 949):</strong> ${materialConstants.sigma1.toExponential(2)} W/m·K</p>
        <p><strong>Calculation Mode:</strong> ${calculationMode === 'current' ? 'Calculate Current (Given Area)' : 'Calculate Area (Given Current)'}</p>
    `;
    
    // Display CALCULATED adiabatic results (Step A)
    // I_AD and S_AD are calculated using formulas, not constants
    document.getElementById('adiabaticCurrent').textContent = 
        `${adiabaticResults.I_AD.toFixed(2)} A`;
    document.getElementById('adiabaticArea').textContent = 
        `${adiabaticResults.S_AD.toFixed(2)} mm²`;
    
    // Show material constants used (for reference, these are inputs to calculations)
    document.getElementById('constantK').textContent = 
        `${adiabaticResults.K} A/mm²·√s (IEC 949 constant)`;
    document.getElementById('constantBeta').textContent = 
        `${adiabaticResults.beta} (IEC 949 constant)`;
    
    // Standards & Assumptions section
    const fVal = params.F;
    const dVal = params.delta;
    const s1 = params.sigma1 ?? materialConstants.sigma1;
    const s2 = params.sigma2 ?? materialConstants.sigma2;
    const s3 = params.sigma3 ?? materialConstants.sigma3;
    const epsApplied = nonAdiabaticResults ? 'Yes' : 'No';
    const setTextIf = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };
    setTextIf('assumptionF', fVal !== undefined ? String(fVal) : '—');
    setTextIf('assumptionDelta', dVal !== undefined ? String(dVal) : '—');
    setTextIf('assumptionSigma1', s1 !== undefined ? Number(s1).toExponential ? Number(s1).toExponential(2) : String(s1) : '—');
    setTextIf('assumptionSigma2', s2 !== undefined ? String(s2) : '—');
    setTextIf('assumptionSigma3', s3 !== undefined ? String(s3) : '—');
    setTextIf('assumptionEpsilonApplied', epsApplied);
    
    // Display CALCULATED non-adiabatic results if calculated (Step B & C)
    const nonAdiabaticSection = document.getElementById('nonAdiabaticSection');
    if (nonAdiabaticResults) {
        nonAdiabaticSection.style.display = 'block';
        // M is calculated using formula: M = (F/(δ·10⁻³)) · ((σ₂ + σ₃)/σ₁)
        document.getElementById('factorM').textContent = 
            `${nonAdiabaticResults.M.toFixed(4)}`;
        // ε is calculated using formula: ε = 1 + 0.61 M√t - 0.069 (M√t)² + 0.0043 (M√t)³
        document.getElementById('epsilon').textContent = 
            `${nonAdiabaticResults.epsilon.toFixed(4)}`;
        // I_perm is calculated using formula: I_perm = ε · I_AD
        document.getElementById('permissibleCurrent').textContent = 
            `${nonAdiabaticResults.I_perm.toFixed(2)} A`;
        // S_non is calculated using formula: S_non = S_AD / ε
        document.getElementById('nonAdiabaticArea').textContent = 
            `${nonAdiabaticResults.S_non.toFixed(2)} mm²`;
    } else {
        nonAdiabaticSection.style.display = 'none';
    }
    
    // Build and render KPI summary grid
    const kpiGrid = document.getElementById('resultKpis');
    if (kpiGrid) {
        const kpis = [
            { label: 'Adiabatic Area Required', value: `${adiabaticResults.S_AD.toFixed(0)} mm²`, cls: 'kpi--primary' },
            { label: 'Adiabatic Current (I_AD)', value: `${adiabaticResults.I_AD.toFixed(0)} A`, cls: 'kpi--secondary' },
        ];
        if (nonAdiabaticResults) {
            kpis.push(
                { label: 'Non-Adiabatic Factor (ε)', value: `${nonAdiabaticResults.epsilon.toFixed(2)}`, cls: 'kpi--accent' },
                { label: 'Adjusted Area (S_non)', value: `${nonAdiabaticResults.S_non.toFixed(0)} mm²`, cls: 'kpi--warning' },
                { label: 'Permissible Current (I_perm)', value: `${nonAdiabaticResults.I_perm.toFixed(0)} A`, cls: 'kpi--success' }
            );
        }
        kpiGrid.innerHTML = kpis.map(k => `
            <div class="kpi ${k.cls}">
                <div class="kpi-label">${k.label}</div>
                <div class="kpi-value">${k.value}</div>
            </div>
        `).join('');
        kpiGrid.style.display = 'grid';
    }

    // Build and render summary snapshot
    const summaryData = buildResultSummary(adiabaticResults, nonAdiabaticResults);
    renderResultSummary(summaryData);
    if (currentCalculationData) {
        currentCalculationData.summary = summaryData;
    }

    // Check cable suitability
    checkCableSuitability(calculationMode, params, adiabaticResults, nonAdiabaticResults);
    
    // Show results card
    resultsCard.style.display = 'block';
    
    // Scroll to results
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Check if cable is suitable based on calculated values
 */
function checkCableSuitability(calculationMode, params, adiabaticResults, nonAdiabaticResults) {
    const suitabilityCard = document.getElementById('suitabilityCheck');
    let isSuitable = false;
    let message = '';
    let recommendation = '';
    let safetyMargin = 0;
    
    if (calculationMode === 'current') {
        // Calculate current given area
        // User provided area, we calculated I_AD (maximum current cable can handle)
        const providedArea = params.area;
        const maxCurrent = nonAdiabaticResults ? nonAdiabaticResults.I_perm : adiabaticResults.I_AD;
        const maxCurrentAdiabatic = adiabaticResults.I_AD;
        
        // Check if user wants to verify against a required current
        const requiredCurrentInput = document.getElementById('current').value;
        const requiredCurrent = requiredCurrentInput ? parseFloat(requiredCurrentInput) : null;
        
        if (requiredCurrent !== null && !isNaN(requiredCurrent)) {
            // User provided a required current to check against
            if (maxCurrent >= requiredCurrent) {
                isSuitable = true;
                safetyMargin = ((maxCurrent - requiredCurrent) / requiredCurrent * 100).toFixed(2);
                message = `✓ Cable is SUITABLE`;
                recommendation = `The cable with area ${providedArea.toFixed(2)} mm² can handle ${maxCurrent.toFixed(2)} A, which exceeds the required ${requiredCurrent.toFixed(2)} A. Safety margin: ${safetyMargin}%`;
            } else {
                isSuitable = false;
                const deficit = ((requiredCurrent - maxCurrent) / requiredCurrent * 100).toFixed(2);
                message = `✗ Cable is NOT SUITABLE`;
                recommendation = `The cable with area ${providedArea.toFixed(2)} mm² can only handle ${maxCurrent.toFixed(2)} A, but ${requiredCurrent.toFixed(2)} A is required. Deficit: ${deficit}%`;
            }
        } else {
            // No required current provided, just show capability
            message = `ℹ Cable Capability`;
            recommendation = `The cable with area ${providedArea.toFixed(2)} mm² can handle up to ${maxCurrent.toFixed(2)} A (${maxCurrentAdiabatic.toFixed(2)} A adiabatic)`;
        }
    } else {
        // Calculate area given current
        // User provided current, we calculated S_AD (minimum area required)
        const providedCurrent = params.current;
        const requiredArea = nonAdiabaticResults ? nonAdiabaticResults.S_non : adiabaticResults.S_AD;
        const requiredAreaAdiabatic = adiabaticResults.S_AD;
        
        // Check if user provided an area to verify
        const providedAreaInput = document.getElementById('crossSection').value;
        const providedArea = providedAreaInput ? parseFloat(providedAreaInput) : null;
        
        if (providedArea !== null && !isNaN(providedArea)) {
            // User provided an area to check against
            if (providedArea >= requiredArea) {
                isSuitable = true;
                safetyMargin = ((providedArea - requiredArea) / requiredArea * 100).toFixed(2);
                message = `✓ Cable is SUITABLE`;
                recommendation = `The provided area (${providedArea.toFixed(2)} mm²) meets the requirement (${requiredArea.toFixed(2)} mm²) for current ${providedCurrent.toFixed(2)} A. Safety margin: ${safetyMargin}%`;
            } else {
                isSuitable = false;
                const deficit = ((requiredArea - providedArea) / requiredArea * 100).toFixed(2);
                message = `✗ Cable is NOT SUITABLE`;
                recommendation = `The provided area (${providedArea.toFixed(2)} mm²) is insufficient. Required: ${requiredArea.toFixed(2)} mm² for current ${providedCurrent.toFixed(2)} A. Deficit: ${deficit}%`;
            }
        } else {
            // No area provided for comparison, just show requirement
            message = `ℹ Area Requirement`;
            recommendation = `Minimum required area: ${requiredArea.toFixed(2)} mm² (${requiredAreaAdiabatic.toFixed(2)} mm² adiabatic) for current ${providedCurrent.toFixed(2)} A`;
        }
    }
    
    const statusClass = isSuitable ? 'suitable' : (message.includes('ℹ') ? 'info' : 'not-suitable');
    suitabilityCard.innerHTML = `
        <div class="suitability-status ${statusClass}">
            <h3><i class="fas ${isSuitable ? 'fa-check-circle' : (message.includes('ℹ') ? 'fa-info-circle' : 'fa-exclamation-triangle')}"></i> ${message}</h3>
            <p>${recommendation}</p>
        </div>
    `;
    suitabilityCard.style.display = 'block';
}

// Build suitability data for export (no DOM writes)
function computeSuitabilityData(calculationMode, params, adiabaticResults, nonAdiabaticResults) {
    let isSuitable = false;
    let message = '';
    let recommendation = '';
    let safetyMarginPct = null;
    
    if (calculationMode === 'current') {
        const providedArea = params.area;
        const maxCurrent = nonAdiabaticResults ? nonAdiabaticResults.I_perm : adiabaticResults.I_AD;
        const requiredCurrentInput = document.getElementById('current')?.value;
        const requiredCurrent = requiredCurrentInput ? parseFloat(requiredCurrentInput) : null;
        if (requiredCurrent !== null && !isNaN(requiredCurrent)) {
            if (maxCurrent >= requiredCurrent) {
                isSuitable = true;
                safetyMarginPct = ((maxCurrent - requiredCurrent) / requiredCurrent * 100);
                message = 'Cable is SUITABLE';
                recommendation = `With ${providedArea?.toFixed ? providedArea.toFixed(2) : providedArea} mm², allowable ${maxCurrent.toFixed(2)} A >= required ${requiredCurrent.toFixed(2)} A.`;
            } else {
                isSuitable = false;
                safetyMarginPct = -((requiredCurrent - maxCurrent) / requiredCurrent * 100);
                message = 'Cable is NOT SUITABLE';
                recommendation = `Allowable ${maxCurrent.toFixed(2)} A < required ${requiredCurrent.toFixed(2)} A. Increase area.`;
            }
        } else {
            message = 'Cable Capability';
            recommendation = `Allowable current: ${maxCurrent.toFixed(2)} A`;
        }
    } else {
        const providedCurrent = params.current;
        const requiredArea = nonAdiabaticResults ? nonAdiabaticResults.S_non : adiabaticResults.S_AD;
        const providedAreaInput = document.getElementById('crossSection')?.value;
        const providedArea = providedAreaInput ? parseFloat(providedAreaInput) : null;
        if (providedArea !== null && !isNaN(providedArea)) {
            if (providedArea >= requiredArea) {
                isSuitable = true;
                safetyMarginPct = ((providedArea - requiredArea) / requiredArea * 100);
                message = 'Cable is SUITABLE';
                recommendation = `Provided ${providedArea.toFixed(2)} mm² >= required ${requiredArea.toFixed(2)} mm² for ${providedCurrent?.toFixed ? providedCurrent.toFixed(2) : providedCurrent} A.`;
            } else {
                isSuitable = false;
                safetyMarginPct = -((requiredArea - providedArea) / requiredArea * 100);
                message = 'Cable is NOT SUITABLE';
                recommendation = `Provided ${providedArea.toFixed(2)} mm² < required ${requiredArea.toFixed(2)} mm² for ${providedCurrent?.toFixed ? providedCurrent.toFixed(2) : providedCurrent} A.`;
            }
        } else {
            message = 'Area Requirement';
            recommendation = `Minimum required area: ${requiredArea.toFixed(2)} mm²`;
        }
    }
    return { isSuitable, message, recommendation, safetyMarginPct };
}

function buildResultSummary(adiabaticResults, nonAdiabaticResults) {
    const epsilon = nonAdiabaticResults ? formatNumber(nonAdiabaticResults.epsilon, 2) : '—';
    const adjustedAreaValue = nonAdiabaticResults ? nonAdiabaticResults.S_non : adiabaticResults.S_AD;
    const suggestedArea = getSuggestedStandardArea(adjustedAreaValue);
    const permissibleCurrentValue = nonAdiabaticResults ? nonAdiabaticResults.I_perm : adiabaticResults.I_AD;

    return {
        'Adiabatic Area Required': formatArea(adiabaticResults.S_AD),
        'Non-Adiabatic Factor (ε)': epsilon,
        'Adjusted Area': adjustedAreaValue ? formatArea(adjustedAreaValue) : '—',
        'Suggested Standard Size': suggestedArea ? formatArea(suggestedArea) : '—',
        'Permissible Current': formatCurrent(permissibleCurrentValue)
    };
}

function renderResultSummary(summaryData) {
    const summaryCard = document.getElementById('resultsSummary');
    if (!summaryCard) return;

    const summaryJson = JSON.stringify(summaryData, null, 2).replace(/\\u00b2/g, '²');
    summaryCard.innerHTML = `
        <h3><i class="fas fa-code"></i> Result Snapshot</h3>
        <pre class="code-block"><code id="summaryCode"></code></pre>
    `;
    const summaryCode = document.getElementById('summaryCode');
    if (summaryCode) {
        summaryCode.textContent = `const result = ${summaryJson};`;
    }
    summaryCard.style.display = 'block';
}

function formatNumber(value, decimals = 0) {
    if (value === null || value === undefined || isNaN(value)) {
        return '—';
    }
    return Number(value).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

function formatArea(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '—';
    }
    return `${formatNumber(value, 0)} mm²`;
}

function formatCurrent(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '—';
    }
    return `${formatNumber(value, 0)} A`;
}

function getSuggestedStandardArea(area) {
    if (area === null || area === undefined || isNaN(area)) {
        return null;
    }
    const roundedArea = STANDARD_CONDUCTOR_AREAS.find(size => size >= area);
    if (roundedArea) {
        return roundedArea;
    }
    // Fallback: round up to nearest 50 mm²
    return Math.ceil(area / 50) * 50;
}

function csvEscape(value) {
    const str = value === undefined || value === null ? '' : String(value);
    const needsQuotes = /[",\n]/.test(str);
    const escaped = str.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
}

/**
 * Export results to CSV
 */
function exportToCSV() {
    if (!currentCalculationData) {
        alert('No calculation data available to export.');
        return;
    }
    
    const data = currentCalculationData;
    let csvContent = 'Heating Calculation Results\n';
    csvContent += 'Generated: ' + new Date().toLocaleString() + '\n\n';
    
    // Material Information
    csvContent += 'Material Information\n';
    csvContent += 'Material,' + csvEscape(data.materialName) + '\n';
    csvContent += 'Constant K (IEC 949),' + csvEscape(`${data.materialConstants.K} A/mm²·√s`) + '\n';
    csvContent += 'Beta (β),' + csvEscape(data.materialConstants.beta) + '\n';
    csvContent += 'Sigma 1 (σ₁),' + csvEscape(`${data.materialConstants.sigma1.toExponential(2)} W/m·K`) + '\n';
    csvContent += 'Calculation Mode,' + csvEscape(data.calculationMode === 'current' ? 'Calculate Current (Given Area)' : 'Calculate Area (Given Current)') + '\n\n';
    
    // Input Parameters
    csvContent += 'Input Parameters\n';
    csvContent += 'Time (s),' + csvEscape(data.inputParams.time) + '\n';
    csvContent += 'Initial Temperature (°C),' + csvEscape(data.inputParams.initialTemp) + '\n';
    csvContent += 'Final Temperature (°C),' + csvEscape(data.inputParams.finalTemp) + '\n';
    if (data.inputParams.current) csvContent += 'Current (A),' + csvEscape(data.inputParams.current) + '\n';
    if (data.inputParams.area) csvContent += 'Area (mm²),' + csvEscape(data.inputParams.area) + '\n';
    csvContent += '\n';
    
    // Adiabatic Results
    csvContent += 'Step A: Adiabatic Results\n';
    csvContent += 'Adiabatic Current (I_AD),' + csvEscape(`${data.adiabaticResults.I_AD.toFixed(2)} A`) + '\n';
    csvContent += 'Adiabatic Area (S_AD),' + csvEscape(`${data.adiabaticResults.S_AD.toFixed(2)} mm²`) + '\n';
    csvContent += '\n';
    
    // Non-Adiabatic Results
    if (data.nonAdiabaticResults) {
        csvContent += 'Step B & C: Non-Adiabatic Results\n';
        csvContent += 'Factor M,' + csvEscape(data.nonAdiabaticResults.M.toFixed(4)) + '\n';
        csvContent += 'Non-Adiabatic Factor (ε),' + csvEscape(data.nonAdiabaticResults.epsilon.toFixed(4)) + '\n';
        csvContent += 'Permissible Current (I_perm),' + csvEscape(`${data.nonAdiabaticResults.I_perm.toFixed(2)} A`) + '\n';
        csvContent += 'Non-Adiabatic Area (S_non),' + csvEscape(`${data.nonAdiabaticResults.S_non.toFixed(2)} mm²`) + '\n';
    }
    
    // Summary object
    if (data.summary) {
        csvContent += '\nResult Snapshot\n';
        Object.entries(data.summary).forEach(([key, value]) => {
            csvContent += `${key},${value}\n`;
        });
    }
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `heating_calculation_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Export results to PDF
 * Improved formatting with wrapping and safe page breaks
 */
function exportToPDF() {
    if (!currentCalculationData) {
        alert('No calculation data available to export.');
        return;
    }
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const data = currentCalculationData;

        const margin = 18;
        const line = 6;
        const pageH = doc.internal.pageSize.getHeight();
        const pageW = doc.internal.pageSize.getWidth();
        const usableW = pageW - margin * 2;
        let yPos = margin;

        const ensureSpace = (advance = line) => {
            if (yPos + advance > pageH - margin) {
                doc.addPage();
                yPos = margin;
            }
        };
        const addTitle = (text) => {
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text(text, margin, yPos);
            doc.setFont(undefined, 'normal');
            yPos += line * 1.6;
        };
        const addSection = (title) => {
            ensureSpace(line * 2);
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(title, margin, yPos);
            doc.setFont(undefined, 'normal');
            yPos += line + 1;
        };
        const addRows = (rows) => {
            doc.setFontSize(10);
            rows.forEach(([label, value]) => {
                const val = value === undefined || value === null ? '—' : String(value);
                const wrapped = doc.splitTextToSize(val, usableW - 60);
                ensureSpace(line * (Array.isArray(wrapped) ? wrapped.length : 1));
                doc.setTextColor(90);
                doc.text(label + ':', margin, yPos);
                doc.setTextColor(20);
                doc.text(wrapped, margin + 55, yPos);
                yPos += line * (Array.isArray(wrapped) ? wrapped.length : 1);
            });
            doc.setTextColor(20);
        };

        // Title + generated date
        addTitle('Heating Calculation Results');
        doc.setFontSize(10);
        addRows([['Generated', new Date().toLocaleString()]]);
        yPos += 2;

        // Material info
        addSection('Material Information');
        addRows([
            ['Material', data.materialName],
            ['Constant K (IEC 949)', `${data.materialConstants.K} A/mm²·√s`],
            ['Beta (β)', data.materialConstants.beta],
            ['Sigma 1 (σ₁)', `${data.materialConstants.sigma1.toExponential(2)} W/m·K`],
            ['Calculation Mode', data.calculationMode === 'current' ? 'Calculate Current (Given Area)' : 'Calculate Area (Given Current)']
        ]);
        yPos += 2;

        // Inputs
        addSection('Input Parameters');
        const inputRows = [
            ['Time', `${data.inputParams.time} s`],
            ['Initial Temperature', `${data.inputParams.initialTemp} °C`],
            ['Final Temperature', `${data.inputParams.finalTemp} °C`]
        ];
        if (data.inputParams.current) inputRows.push(['Current', `${data.inputParams.current} A`]);
        if (data.inputParams.area) inputRows.push(['Area', `${data.inputParams.area} mm²`]);
        addRows(inputRows);
        yPos += 2;

        // Step A
        addSection('Step A: Adiabatic Results');
        addRows([
            ['Adiabatic Current (I_AD)', `${data.adiabaticResults.I_AD.toFixed(2)} A`],
            ['Adiabatic Area (S_AD)', `${data.adiabaticResults.S_AD.toFixed(2)} mm²`]
        ]);
        yPos += 2;

        // Step B & C
        if (data.nonAdiabaticResults) {
            addSection('Step B & C: Non-Adiabatic Results');
            addRows([
                ['Factor M', data.nonAdiabaticResults.M.toFixed(4)],
                ['Non-Adiabatic Factor (ε)', data.nonAdiabaticResults.epsilon.toFixed(4)],
                ['Permissible Current (I_perm)', `${data.nonAdiabaticResults.I_perm.toFixed(2)} A`],
                ['Non-Adiabatic Area (S_non)', `${data.nonAdiabaticResults.S_non.toFixed(2)} mm²`]
            ]);
            yPos += 2;
        }

        // Key Results (single-column to avoid collisions)
        addSection('Key Results');
        const kpiRows = [
            ['Adiabatic Area', `${data.adiabaticResults.S_AD.toFixed(0)} mm²`],
            ['I_AD', `${data.adiabaticResults.I_AD.toFixed(0)} A`]
        ];
        if (data.nonAdiabaticResults) {
            kpiRows.push(['ε', `${data.nonAdiabaticResults.epsilon.toFixed(2)}`]);
            kpiRows.push(['S_non', `${data.nonAdiabaticResults.S_non.toFixed(0)} mm²`]);
            kpiRows.push(['I_perm', `${data.nonAdiabaticResults.I_perm.toFixed(0)} A`]);
        }
        addRows(kpiRows);
        yPos += 2;

        // Standards & Assumptions header in PDF as well
        addSection('Standards & Assumptions');
        addRows([
            ['Factor F', data.inputParams.F ?? data.materialConstants.F ?? '—'],
            ['Delta (δ)', data.inputParams.delta ?? data.materialConstants.delta ?? '—'],
            ['Sigma 1 (σ₁)', (data.inputParams.sigma1 ?? data.materialConstants.sigma1)?.toExponential ? (data.inputParams.sigma1 ?? data.materialConstants.sigma1).toExponential(2) + ' W/m·K' : (data.inputParams.sigma1 ?? data.materialConstants.sigma1)],
            ['Sigma 2 (σ₂)', data.inputParams.sigma2 ?? data.materialConstants.sigma2 ?? '—'],
            ['Sigma 3 (σ₃)', data.inputParams.sigma3 ?? data.materialConstants.sigma3 ?? '—'],
            ['ε Applied', data.nonAdiabaticResults ? 'Yes' : 'No']
        ]);
        yPos += 2;

        // Suitability Verdict
        const suit = computeSuitabilityData(data.calculationMode, data.inputParams, data.adiabaticResults, data.nonAdiabaticResults);
        addSection('Suitability Verdict');
        addRows([
            ['Status', suit.message],
            ['Details', suit.recommendation],
            ['Safety Margin', suit.safetyMarginPct === null || suit.safetyMarginPct === undefined ? '—' : `${suit.safetyMarginPct.toFixed(2)} %`]
        ]);
        yPos += 2;

        // Result Snapshot
        if (data.summary) {
            addSection('Result Snapshot');
            doc.setFontSize(9);
            const pairs = Object.entries(data.summary).map(([k, v]) => `${k}: ${v}`);
            const wrapped = pairs.flatMap(line => doc.splitTextToSize(line, usableW));
            wrapped.forEach(w => {
                ensureSpace(line);
                doc.text(w, margin, yPos);
                yPos += line;
            });
        }

        doc.save(`heating_calculation_${new Date().getTime()}.pdf`);
    } catch (e) {
        alert('Error generating PDF. Please ensure jsPDF library is loaded.');
        console.error(e);
    }
}

/**
 * Reset form
 */
function resetForm() {
    document.getElementById('heatingForm').reset();
    document.getElementById('conductorTypeGroup').style.display = 'none';
    document.getElementById('nonAdiabaticParams').style.display = 'none';
    document.getElementById('results').style.display = 'none';
    const suitabilityCard = document.getElementById('suitabilityCheck');
    if (suitabilityCard) {
        suitabilityCard.style.display = 'none';
        suitabilityCard.innerHTML = '';
    }
    const summaryCard = document.getElementById('resultsSummary');
    if (summaryCard) {
        summaryCard.style.display = 'none';
        summaryCard.innerHTML = '';
    }
    document.getElementById('initialTemp').value = DEFAULT_VALUES.initialTemp;
    document.getElementById('finalTemp').value = DEFAULT_VALUES.finalTemp;
    document.getElementById('F').value = DEFAULT_VALUES.F;
    document.getElementById('delta').value = DEFAULT_VALUES.delta;
    document.getElementById('sigma1').value = DEFAULT_VALUES.sigma1;
    document.getElementById('sigma2').value = DEFAULT_VALUES.sigma2;
    document.getElementById('sigma3').value = DEFAULT_VALUES.sigma3;
    currentCalculationData = null;
    
    // Reset calculation mode visibility
    const currentGroup = document.getElementById('currentGroup');
    const areaGroup = document.getElementById('areaGroup');
    currentGroup.style.display = 'block';
    areaGroup.style.display = 'block';
}
