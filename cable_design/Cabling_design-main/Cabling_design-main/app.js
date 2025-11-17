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
    
    // Initialize form handlers
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
            const sheathTypeGroup = document.getElementById('sheathTypeGroup');
            const sheathType = document.getElementById('sheathType');
            const initialTempInput = document.getElementById('initialTemp');
            const finalTempInput = document.getElementById('finalTemp');
            const nonAdiabaticCheckbox = document.getElementById('calculateNonAdiabatic');
            const nonAdiabaticParams = document.getElementById('nonAdiabaticParams');
            
            if (this.value === 'conductor') {
                if (conductorTypeGroup) conductorTypeGroup.style.display = 'block';
                if (sheathTypeGroup) sheathTypeGroup.style.display = 'none';
                if (conductorType) {
                    conductorType.required = true;
                }
                if (sheathType) {
                    sheathType.required = false;
                    sheathType.value = '';
                }
                if (initialTempInput) {
                    initialTempInput.value = 90;
                    initialTempInput.disabled = true;
                }
                if (finalTempInput) {
                    finalTempInput.value = 250;
                    finalTempInput.disabled = true;
                }
                // Hide non-adiabatic option for conductors
                if (nonAdiabaticCheckbox) {
                    nonAdiabaticCheckbox.checked = false;
                    nonAdiabaticCheckbox.disabled = true;
                }
                if (nonAdiabaticParams) {
                    nonAdiabaticParams.style.display = 'none';
                }
            } else if (this.value === 'sheath') {
                if (conductorTypeGroup) conductorTypeGroup.style.display = 'none';
                if (sheathTypeGroup) sheathTypeGroup.style.display = 'block';
                if (conductorType) {
                    conductorType.required = false;
                    conductorType.value = '';
                }
                if (sheathType) sheathType.required = true;
                if (initialTempInput) {
                    initialTempInput.value = 90;
                    initialTempInput.disabled = true;
                }
                if (finalTempInput) {
                    finalTempInput.value = 250;
                    finalTempInput.disabled = true;
                }
                if (nonAdiabaticCheckbox) {
                    nonAdiabaticCheckbox.checked = false;
                    nonAdiabaticCheckbox.disabled = true;
                }
                if (nonAdiabaticParams) {
                    nonAdiabaticParams.style.display = 'none';
                }
            } else {
                if (conductorTypeGroup) conductorTypeGroup.style.display = 'none';
                if (sheathTypeGroup) sheathTypeGroup.style.display = 'none';
                if (conductorType) {
                    conductorType.required = false;
                    conductorType.value = '';
                }
                if (sheathType) {
                    sheathType.required = false;
                    sheathType.value = '';
                }
                // Enable temperature inputs for non-conductors
                if (initialTempInput) {
                    initialTempInput.disabled = false;
                }
                if (finalTempInput) {
                    finalTempInput.disabled = false;
                }
                // Enable non-adiabatic option
                if (nonAdiabaticCheckbox) {
                    nonAdiabaticCheckbox.disabled = false;
                }
            }
        });
    }
    
    // Make conductor type visible by default and set fixed temperatures
    const conductorTypeGroup = document.getElementById('conductorTypeGroup');
    const conductorType = document.getElementById('conductorType');
    const sheathTypeGroup = document.getElementById('sheathTypeGroup');
    const sheathType = document.getElementById('sheathType');
    const initialTempInput = document.getElementById('initialTemp');
    const finalTempInput = document.getElementById('finalTemp');
    
    if (conductorTypeGroup) {
        conductorTypeGroup.style.display = 'block';
    }
    if (conductorType) {
        conductorType.required = true;
    }
    if (sheathTypeGroup) {
        sheathTypeGroup.style.display = 'none';
    }
    if (sheathType) {
        sheathType.required = false;
    }
    if (initialTempInput) {
        initialTempInput.value = 90;
        initialTempInput.disabled = true;
    }
    if (finalTempInput) {
        finalTempInput.value = 250;
        finalTempInput.disabled = true;
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
            
            // Add loading state with smooth animation
            const calculateBtn = document.querySelector('.calculate-btn');
            if (calculateBtn) {
                const originalBtnText = calculateBtn.innerHTML;
                calculateBtn.classList.add('calculating');
                calculateBtn.disabled = true;
                calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
                
                // Reset button after calculation
                setTimeout(() => {
                    calculateBtn.classList.remove('calculating');
                    calculateBtn.disabled = false;
                    calculateBtn.innerHTML = originalBtnText;
                }, 1000);
            }
            
            // Get form values
            const materialType = document.getElementById('materialType').value;
            const conductorType = document.getElementById('conductorType').value;
            const sheathType = document.getElementById('sheathType').value;
            const calculationMode = document.getElementById('calculationMode').value;
            // Convert kA to A for calculations
            const currentInKA = parseFloat(document.getElementById('current').value);
            const current = currentInKA ? currentInKA * 1000 : null; // Convert kA to A
            const area = parseFloat(document.getElementById('crossSection').value);
            const time = parseFloat(document.getElementById('time').value);
            const voltage = parseFloat(document.getElementById('voltage').value);
            
            // Fixed temperatures for all calculations
            const initialTemp = 90;
            const finalTemp = 250;
            
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
            
            if (materialType === 'conductor') {
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
            } else if (materialType === 'sheath') {
                if (!sheathType) {
                    alert('Please select a sheath or armour material.');
                    return;
                }
                materialConstants = MATERIAL_CONSTANTS[sheathType];
                if (!materialConstants) {
                    alert('Selected sheath material is not configured.');
                    return;
                }
                materialName = materialConstants.name || 'Sheath';
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
                voltage: voltage || null,
                materialType,
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
                    sheathType,
                    current: calculationMode === 'area' ? current : null,
                    area: calculationMode === 'current' ? area : null,
                    time,
                    initialTemp,
                    finalTemp,
                    voltage: voltage || null,
                    calculateNonAdiabatic
                }
            };
            
            // Display results with animation
            setTimeout(() => {
                displayResults(materialName, materialConstants, adiabaticResults, nonAdiabaticResults, calculationMode, params);
                
                // Remove loading state
                if (calculateBtn) {
                    calculateBtn.classList.remove('calculating');
                    calculateBtn.disabled = false;
                    calculateBtn.innerHTML = originalBtnText;
                }
            }, 500); // Small delay for smooth transition
        });
    }
}

/**
 * Display calculation results
 * All values shown are CALCULATED using the formulas, not constants
 */
function displayResults(materialName, materialConstants, adiabaticResults, nonAdiabaticResults, calculationMode, params) {
    const resultsCard = document.getElementById('results');
    const highlightGrid = document.getElementById('resultsHighlights');
    const resultDetails = document.getElementById('resultDetails');
    const logTerm = Math.log((params.finalTemp + materialConstants.beta) / (params.initialTemp + materialConstants.beta));
    const suggestedArea = getSuggestedStandardArea(adiabaticResults.S_AD);
    const timeSeconds = params.time ?? params?.inputParams?.time ?? 0;
    const voltage = params.voltage || currentCalculationData?.inputParams?.voltage;

    if (highlightGrid) {
        const highlightData = [
            {
                icon: 'fas fa-bolt',
                title: 'Adiabatic Current',
                value: `${(adiabaticResults.I_AD / 1000).toFixed(2)} kA`,
                subtext: 'Fault withstand capability'
            },
            {
                icon: 'fas fa-border-all',
                title: 'Calculated S_AD',
                value: `${adiabaticResults.S_AD.toFixed(2)} mm²`,
                subtext: 'Minimum required area'
            },
            {
                icon: 'fas fa-crop-alt',
                title: 'Suggested Standard',
                value: `${suggestedArea ? suggestedArea.toFixed(2) : '—'} mm²`,
                subtext: 'Next preferred IEC size'
            },
            {
                icon: 'fas fa-magnet',
                title: 'K Constant',
                value: `${adiabaticResults.K} A/mm²·√s`,
                subtext: 'Source: IEC 949'
            },
            {
                icon: 'fas fa-temperature-high',
                title: 'β Constant',
                value: `${adiabaticResults.beta}`,
                subtext: 'Thermal coefficient'
            }
        ];

        highlightGrid.innerHTML = highlightData.map(data => `
            <div class="highlight-card">
                <i class="${data.icon}"></i>
                <h4>${data.title}</h4>
                <div class="value">${data.value}</div>
                <p>${data.subtext}</p>
            </div>
        `).join('');
    }

    if (resultDetails) {
        resultDetails.innerHTML = `
            <div class="detail-card">
                <h3><i class="fas fa-equals"></i> Current Formula</h3>
                <p class="formula">I_AD = K · S · √(ln((θ_f + β)/(θ_i + β)) / t)</p>
                <ul class="formula-desc">
                    <li><strong>K</strong> – Material constant from IEC 949 (A/mm²·√s)</li>
                    <li><strong>S</strong> – Cross-sectional area of the conductor (mm²)</li>
                    <li><strong>θ_f</strong> – Final conductor temperature (°C)</li>
                    <li><strong>θ_i</strong> – Initial conductor temperature (°C)</li>
                    <li><strong>β</strong> – Temperature coefficient for the material</li>
                    <li><strong>t</strong> – Fault duration window considered adiabatic (s)</li>
                </ul>
            </div>
            <div class="detail-card">
                <h3><i class="fas fa-square"></i> Area Formula</h3>
                <p class="formula">S_AD = (I · √t) / (K · √ln((θ_f + β)/(θ_i + β)))</p>
                <ul class="formula-desc">
                    <li><strong>I</strong> – Fault current to be withstood (A)</li>
                    <li><strong>K</strong> – Material constant (A/mm²·√s)</li>
                    <li><strong>t</strong> – Fault clearing time (s)</li>
                    <li><strong>θ_f</strong> – Final allowable conductor temperature during the fault (°C)</li>
                    <li><strong>θ_i</strong> – Initial conductor temperature immediately before the event (°C)</li>
                    <li><strong>β</strong> – Material coefficient relating resistivity to temperature</li>
                    <li><strong>Suggested IEC size</strong> – Rounded area to the next standard conductor size</li>
                </ul>
            </div>
        `;
    }

    const summaryData = buildResultSummary(adiabaticResults, suggestedArea);
    if (currentCalculationData) {
        currentCalculationData.summary = summaryData;
    }

    resultsCard.style.display = 'block';
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
        const requiredCurrent = requiredCurrentInput ? parseFloat(requiredCurrentInput) * 1000 : null; // Convert kA to A
        if (requiredCurrent !== null && !isNaN(requiredCurrent)) {
            if (maxCurrent >= requiredCurrent) {
                isSuitable = true;
                safetyMarginPct = ((maxCurrent - requiredCurrent) / requiredCurrent * 100);
                message = 'Cable is SUITABLE';
                recommendation = `Cable with ${providedArea?.toFixed ? providedArea.toFixed(2) : providedArea} mm² can handle ${(maxCurrent / 1000).toFixed(2)} kA, exceeding the required ${(requiredCurrent / 1000).toFixed(2)} kA. Safety margin: ${safetyMarginPct.toFixed(2)}%`;
            } else {
                isSuitable = false;
                safetyMarginPct = -((requiredCurrent - maxCurrent) / requiredCurrent * 100);
                message = 'Cable is NOT SUITABLE';
                recommendation = `Cable can only handle ${(maxCurrent / 1000).toFixed(2)} kA, but ${(requiredCurrent / 1000).toFixed(2)} kA is required. Deficit: ${Math.abs(safetyMarginPct).toFixed(2)}%. Please select a larger cross-sectional area.`;
            }
        } else {
            message = 'Cable Capability';
            recommendation = `Cable can handle up to ${(maxCurrent / 1000).toFixed(2)} kA`;
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
                recommendation = `Provided ${providedArea.toFixed(2)} mm² meets the requirement of ${requiredArea.toFixed(2)} mm² for ${(providedCurrent / 1000).toFixed ? (providedCurrent / 1000).toFixed(2) : (providedCurrent / 1000)} kA. Safety margin: ${safetyMarginPct.toFixed(2)}%`;
            } else {
                isSuitable = false;
                safetyMarginPct = -((requiredArea - providedArea) / requiredArea * 100);
                message = 'Cable is NOT SUITABLE';
                recommendation = `Provided ${providedArea.toFixed(2)} mm² is insufficient. Required: ${requiredArea.toFixed(2)} mm² for ${(providedCurrent / 1000).toFixed ? (providedCurrent / 1000).toFixed(2) : (providedCurrent / 1000)} kA. Deficit: ${Math.abs(safetyMarginPct).toFixed(2)}%`;
            }
        } else {
            message = 'Area Requirement';
            recommendation = `Minimum required area: ${requiredArea.toFixed(2)} mm² for ${(providedCurrent / 1000).toFixed ? (providedCurrent / 1000).toFixed(2) : (providedCurrent / 1000)} kA`;
        }
    }
    return { isSuitable, message, recommendation, safetyMarginPct };
}

function buildResultSummary(adiabaticResults, suggestedArea) {
    return {
        'Adiabatic Area Required': formatArea(adiabaticResults.S_AD),
        'Suggested Standard Size': suggestedArea ? formatArea(suggestedArea) : '—',
        'Adiabatic Current (I_AD)': `${(adiabaticResults.I_AD / 1000).toFixed(2)} kA`
    };
}

// Removed interactive panel helpers (not needed in simplified view)

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
    return `${formatNumber(value, 2)} mm²`;
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
    csvContent += 'Initial Temperature (°C),' + csvEscape('90 (Fixed)') + '\n';
    csvContent += 'Final Temperature (°C),' + csvEscape('250 (Fixed)') + '\n';
    if (data.inputParams.current) csvContent += 'Current (A),' + csvEscape(data.inputParams.current) + '\n';
    if (data.inputParams.area) csvContent += 'Area (mm²),' + csvEscape(data.inputParams.area) + '\n';
    if (data.inputParams.voltage) csvContent += 'Voltage (kV),' + csvEscape(data.inputParams.voltage) + '\n';
    csvContent += '\n';
    
    // Adiabatic Results
    csvContent += 'Step A: Adiabatic Results\n';
    csvContent += 'Adiabatic Current (I_AD),' + csvEscape(`${(data.adiabaticResults.I_AD / 1000).toFixed(2)} kA`) + '\n';
    csvContent += 'Adiabatic Area (S_AD),' + csvEscape(`${data.adiabaticResults.S_AD.toFixed(2)} mm²`) + '\n';
    csvContent += '\n';
    
    // Non-Adiabatic Results
    if (data.nonAdiabaticResults) {
        csvContent += 'Step B & C: Non-Adiabatic Results\n';
        csvContent += 'Factor M,' + csvEscape(data.nonAdiabaticResults.M.toFixed(4)) + '\n';
        csvContent += 'Non-Adiabatic Factor (ε),' + csvEscape(data.nonAdiabaticResults.epsilon.toFixed(4)) + '\n';
        csvContent += 'Permissible Current (I_perm),' + csvEscape(`${(data.nonAdiabaticResults.I_perm / 1000).toFixed(2)} kA`) + '\n';
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

        // Function to add logo at the top
        const addLogo = async () => {
            try {
                const logoImg = document.getElementById('companyLogo');
                if (logoImg && logoImg.src) {
                    // Try to load the logo image
                    const img = new Image();
                    img.crossOrigin = 'anonymous';
                    
                    return new Promise((resolve) => {
                        img.onload = () => {
                            try {
                                // Convert image to base64
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');
                                canvas.width = img.width;
                                canvas.height = img.height;
                                ctx.drawImage(img, 0, 0);
                                
                                const imgData = canvas.toDataURL('image/png');
                                const logoWidth = 40;
                                const logoHeight = (img.height / img.width) * logoWidth;
                                
                                doc.addImage(imgData, 'PNG', margin, margin - 5, logoWidth, logoHeight);
                                yPos = margin + logoHeight + 5;
                                resolve();
                            } catch (e) {
                                // If image loading fails, add text logo
                                doc.setFontSize(10);
                                doc.setTextColor(59, 130, 246); // Medium blue
                                doc.setFont(undefined, 'bold');
                                doc.text('Balfour Beatty', margin, margin + 5);
                                yPos = margin + 10;
                                resolve();
                            }
                        };
                        
                        img.onerror = () => {
                            // Fallback to text logo
                            doc.setFontSize(10);
                            doc.setTextColor(59, 130, 246); // Medium blue
                            doc.setFont(undefined, 'bold');
                            doc.text('Balfour Beatty', margin, margin + 5);
                            yPos = margin + 10;
                            resolve();
                        };
                        
                        img.src = logoImg.src;
                    });
                } else {
                    // No logo element, add text logo
                    doc.setFontSize(10);
                    doc.setTextColor(59, 130, 246); // Medium blue
                    doc.setFont(undefined, 'bold');
                    doc.text('Balfour Beatty', margin, margin + 5);
                    yPos = margin + 10;
                    return Promise.resolve();
                }
            } catch (e) {
                // Fallback to text logo
                doc.setFontSize(10);
                doc.setTextColor(59, 130, 246); // Medium blue
                doc.setFont(undefined, 'bold');
                doc.text('Balfour Beatty', margin, margin + 5);
                yPos = margin + 10;
                return Promise.resolve();
            }
        };

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

        // Add logo first, then continue with rest of PDF
        addLogo().then(() => {
            // Add a line separator after logo
            doc.setDrawColor(200, 200, 200);
            doc.line(margin, yPos + 2, pageW - margin, yPos + 2);
            yPos += 5;

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
                ['Initial Temperature', `90 °C (Fixed)`],
                ['Final Temperature', `250 °C (Fixed)`]
            ];
            if (data.inputParams.current) inputRows.push(['Current', `${(data.inputParams.current / 1000).toFixed(2)} kA`]);
            if (data.inputParams.area) inputRows.push(['Area', `${data.inputParams.area} mm²`]);
            if (data.inputParams.voltage) inputRows.push(['Voltage', `${data.inputParams.voltage} kV`]);
            addRows(inputRows);
            yPos += 2;

            // Step A
            addSection('Step A: Adiabatic Results');
            addRows([
                ['Adiabatic Current (I_AD)', `${(data.adiabaticResults.I_AD / 1000).toFixed(2)} kA`],
                ['Adiabatic Area (S_AD)', `${data.adiabaticResults.S_AD.toFixed(2)} mm²`]
            ]);
            yPos += 2;

            // Step B & C
            if (data.nonAdiabaticResults) {
                addSection('Step B & C: Non-Adiabatic Results');
                addRows([
                    ['Factor M', data.nonAdiabaticResults.M.toFixed(4)],
                    ['Non-Adiabatic Factor (ε)', data.nonAdiabaticResults.epsilon.toFixed(4)],
                    ['Permissible Current (I_perm)', `${(data.nonAdiabaticResults.I_perm / 1000).toFixed(2)} kA`],
                    ['Non-Adiabatic Area (S_non)', `${data.nonAdiabaticResults.S_non.toFixed(2)} mm²`]
                ]);
                yPos += 2;
            }

            // Key Results (single-column to avoid collisions)
            addSection('Key Results');
            const kpiRows = [
                ['Adiabatic Area', `${data.adiabaticResults.S_AD.toFixed(2)} mm²`],
                ['I_AD', `${(data.adiabaticResults.I_AD / 1000).toFixed(2)} kA`]
            ];
            if (data.nonAdiabaticResults) {
                kpiRows.push(['ε', `${data.nonAdiabaticResults.epsilon.toFixed(2)}`]);
                kpiRows.push(['S_non', `${data.nonAdiabaticResults.S_non.toFixed(2)} mm²`]);
                kpiRows.push(['I_perm', `${(data.nonAdiabaticResults.I_perm / 1000).toFixed(2)} kA`]);
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
        }).catch(() => {
            // If logo loading fails completely, just continue without it
            alert('Error loading logo for PDF. Generating PDF without logo.');
        });
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
    document.getElementById('conductorTypeGroup').style.display = 'block'; // Keep visible
    document.getElementById('conductorType').required = true; // Keep required
    const sheathTypeGroup = document.getElementById('sheathTypeGroup');
    const sheathType = document.getElementById('sheathType');
    if (sheathTypeGroup) sheathTypeGroup.style.display = 'none';
    if (sheathType) {
        sheathType.required = false;
        sheathType.value = '';
    }
    document.getElementById('nonAdiabaticParams').style.display = 'none';
    document.getElementById('results').style.display = 'none';
    
    // Keep temperature fields fixed
    const initialTempInput = document.getElementById('initialTemp');
    const finalTempInput = document.getElementById('finalTemp');
    const nonAdiabaticCheckbox = document.getElementById('calculateNonAdiabatic');
    if (initialTempInput) {
        initialTempInput.value = 90;
        initialTempInput.disabled = true;
    }
    if (finalTempInput) {
        finalTempInput.value = 250;
        finalTempInput.disabled = true;
    }
    if (nonAdiabaticCheckbox) nonAdiabaticCheckbox.disabled = false;
    
    // Clear voltage field
    const voltageInput = document.getElementById('voltage');
    if (voltageInput) voltageInput.value = '';
    
    // Reset calculation mode visibility
    const currentGroup = document.getElementById('currentGroup');
    const areaGroup = document.getElementById('areaGroup');
    if (currentGroup) currentGroup.style.display = 'block';
    if (areaGroup) areaGroup.style.display = 'block';
    
    currentCalculationData = null;
}
