document.addEventListener('DOMContentLoaded', function() {
    // --- Constants ---
    const DEFAULT_BATTERY_VOLTAGE = 24; // Default battery voltage
    const DEFAULT_USABLE_CAPACITY = 0.75; // Default usable battery capacity (75% DoD)
    const DEFAULT_SOLAR_PANEL_VOLTAGE = 36; // Typical solar panel voltage
    const DEFAULT_SOLAR_PANEL_CHARGING_WATT_PER_AH = 600; // Rule of thumb: 600W per 200Ah battery
  
    // --- DOM Elements ---
    const applianceTable = document.getElementById('appliance-table');
    const addApplianceButton = document.getElementById('add-row');
    const calculateButton = document.getElementById('calculate');
  
    const inverterSizeSpan = document.getElementById('inverter-size');
    const batteryBankSpan = document.getElementById('battery-bank');
    const solarPanelsSpan = document.getElementById('solar-panels');
    const chargeControllerSpan = document.getElementById('charge-controller');
  
    const batteryQuantityQuotation = document.getElementById('battery-qty-quotation');
    const solarPanelQuantityQuotation = document.getElementById('solar-panel-qty-quotation');
    const inverterQuantity = document.getElementById('inverter-qty');
  
    const batteryVoltageSelect = document.getElementById('battery-voltage');
    const batteryTypeSelect = document.getElementById('battery-type');
    const panelWattageSelect = document.getElementById('panel-wattage');
    const chargeControllerTypeSelect = document.getElementById('charge-controller-type');
    const inverterTypeSelect = document.getElementById('inverter-type');
  
    const quotationTotalSpan = document.getElementById('quotation-total');
  
    const installationMaterialsTable = document.getElementById('installation-materials-table');
    const addMaterialButton = document.getElementById('add-material-row');
    const materialsTotalSpan = document.getElementById('materials-total');
  
    const calculationModal = document.getElementById('calculation-modal');
    const calculationButton = document.querySelector('.tooltip');
    const closeButton = document.querySelector('.close-button');
  
    // Theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    const logo = document.querySelector('.logo');
  
    // Check if dark mode is enabled in local storage
    const isDarkMode = localStorage.getItem('darkMode') === 'enabled';
  
    // Set initial theme based on local storage
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
      logo.src = 'Assets/solarscope-logo-dark.jpeg'; // Update the logo for dark mode
    } else {
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
      logo.src = 'Assets/solarscope-logo-lght.jpeg'; // Set the default logo
    }
  
    // Function to toggle the theme
    function toggleTheme() {
      document.body.classList.toggle('dark-mode');
  
      const isDarkMode = document.body.classList.contains('dark-mode');
      themeToggle.querySelector('i').classList.toggle('fa-sun', isDarkMode);
      themeToggle.querySelector('i').classList.toggle('fa-moon', !isDarkMode);
  
      // Save the state in local storage
      localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
  
    }
  
    // Event listener for theme toggle button
    themeToggle.addEventListener('click', toggleTheme);
  
    // Function to calculate the total power and energy consumption of all appliances
    function calculateApplianceLoad() {
      let totalWatts = 0; // Total wattage of all appliances
      let totalWattHours = 0; // Total watt-hours consumed per day
  
      const rows = applianceTable.querySelectorAll('tbody tr'); // Get all appliance rows
      rows.forEach(row => {
        const watts = parseFloat(row.querySelector('.watts').value) || 0; // Wattage of the appliance
        const quantity = parseFloat(row.querySelector('.quantity').value) || 0; // Number of appliances
        const usageHours = parseFloat(row.querySelector('.usage').value) || 0; // Usage hours per day
  
        totalWatts += watts * quantity; // Add to total wattage
        totalWattHours += watts * quantity * usageHours; // Add to total watt-hours
      });
  
      return {
        totalWatts,
        totalWattHours
      }; // Return the results
    }
  
    // Function to calculate the required inverter size, battery bank, solar panels, and charge controller
    function calculateSystemRequirements(totalWatts, totalWattHours) {
      // --- Inverter Calculation ---
      // According to best practice, the inverter size is calculated by summing the total wattage of all appliances and multiplying by 1.5 for a 50% contingency
      const inverterSize = totalWatts * 1.5;
      const inverterWatts = inverterSize;
  
      // --- Battery Calculation ---
      // Get user selected options for battery and voltage
      const batteryVoltage = parseInt(batteryVoltageSelect.value);
      const batteryAh = parseInt(batteryTypeSelect.value);
      const usableCapacity = DEFAULT_USABLE_CAPACITY; // 75% Depth of Discharge
      const batteryWattHours = batteryVoltage * batteryAh * usableCapacity; // Total battery capacity in watt-hours
  
      // To calculate total watt-hours needed with contingencies (50% + 15%)
      const totalWattHoursWithContingencies = totalWattHours * 1.5 * 1.15;
  
      // the number of batteries required (adjusting for series connection)
      const numberOfBatteries = Math.ceil(totalWattHoursWithContingencies / batteryWattHours);
  
      // --- Solar Panel Calculation ---
      const panelWattage = parseInt(panelWattageSelect.value);
      // The solar panel Watts Needed
      const solarPanelWattsNeeded = (numberOfBatteries * batteryAh / 200) * DEFAULT_SOLAR_PANEL_CHARGING_WATT_PER_AH; // Rule of thumb for 200Ah battery
      const numberOfSolarPanels = Math.ceil(solarPanelWattsNeeded / panelWattage); // calculate required number of solar panels
  
      // --- Charge Controller Calculation ---
      // To Calculate Charge Controller Amperage based solar panel voltage and the battery voltage.
      const solarPanelVoltage = DEFAULT_SOLAR_PANEL_VOLTAGE; // Typical solar panel voltage
      const chargeControllerAmps = (numberOfSolarPanels * panelWattage) / batteryVoltage;
  
      return {
        inverterWatts,
        numberOfBatteries,
        batteryVoltage,
        batteryAh,
        panelWattage,
        numberOfSolarPanels,
        chargeControllerAmps
      };
    }
  
    // Function to update the results in the HTML
    function updateResults(inverterWatts, numberOfBatteries, batteryVoltage, batteryAh, numberOfSolarPanels, panelWattage, chargeControllerAmps) {
      inverterSizeSpan.textContent = inverterWatts.toFixed(2);
      batteryBankSpan.textContent = `${numberOfBatteries} x ${batteryAh}Ah Batteries (${batteryVoltage}V System)`;
      solarPanelsSpan.textContent = `${numberOfSolarPanels} x ${panelWattage}W Panels`;
      chargeControllerSpan.textContent = chargeControllerAmps.toFixed(2);
  
      batteryQuantityQuotation.textContent = numberOfBatteries;
      solarPanelQuantityQuotation.textContent = numberOfSolarPanels;
      inverterQuantity.textContent = 1;
    }
  
    // Function to update the quotation table
    function updateQuotationTable() {
      let quotationTotal = 0;
      const rates = document.querySelectorAll('#quotation-table .rate'); // Target rates within quotation table
  
      rates.forEach(rateInput => {
        const rate = parseFloat(rateInput.value) || 0;
        const item = rateInput.dataset.item;
        let quantity = 1;
  
        if (item === 'battery') {
          quantity = parseInt(document.getElementById('battery-qty-quotation').textContent);
        } else if (item === 'solar-panel') {
          quantity = parseInt(document.getElementById('solar-panel-qty-quotation').textContent);
        }
  
        const amount = rate * quantity;
        rateInput.closest('tr').querySelector('.amount').textContent = amount.toFixed(2);
        quotationTotal += amount;
      });
  
      quotationTotalSpan.textContent = quotationTotal.toFixed(2);
    }
  
    // Function to update the materials table
    function updateMaterialsTable() {
      let materialsTotal = 0;
      const materialRows = installationMaterialsTable.querySelectorAll('tbody tr');
  
      materialRows.forEach(row => {
        const quantityInput = row.querySelector('.material-quantity');
        const rateInput = row.querySelector('.rate');
        const amountCell = row.querySelector('.amount');
  
        const quantity = parseFloat(quantityInput.value) || 0;
        const rate = parseFloat(rateInput.value) || 0;
        const amount = quantity * rate;
  
        amountCell.textContent = amount.toFixed(2);
        materialsTotal += amount;
      });
  
      materialsTotalSpan.textContent = materialsTotal.toFixed(2);
    }
  
    // Function to handle the calculation process
    function handleCalculation() {
      // Calculate appliance load
      const {
        totalWatts,
        totalWattHours
      } = calculateApplianceLoad();
  
      // Calculate system requirements
      const {
        inverterWatts,
        numberOfBatteries,
        batteryVoltage,
        batteryAh,
        numberOfSolarPanels,
        panelWattage,
        chargeControllerAmps
      } = calculateSystemRequirements(totalWatts, totalWattHours);
  
      // Update the results in the HTML
      updateResults(inverterWatts, numberOfBatteries, batteryVoltage, batteryAh, numberOfSolarPanels, panelWattage, chargeControllerAmps);
  
      // Update the quotation table
      updateQuotationTable();
  
      // Update the materials table
      updateMaterialsTable();
    }
  
    // Function to add a new row to the appliance table
    function addApplianceRow() {
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
              <td><input type="text" value="New Item" class="item"></td>
              <td><input type="number" value="100" class="watts"></td>
              <td><input type="number" value="1" class="quantity"></td>
              <td><input type="number" value="5" class="usage"></td>
              <td><button class="remove-row">Remove</button></td>
          `;
      applianceTable.querySelector('tbody').appendChild(newRow);
  
      // Add event listener to the new remove button
      newRow.querySelector('.remove-row').addEventListener('click', function() {
        this.closest('tr').remove();
        handleCalculation();
      });
    }
  
    // Function to add a new row to the installation materials table
    function addMaterialRow() {
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
              <td><input type="text" value="New Material" class="material-item"></td>
              <td><input type="number" value="1" class="material-quantity"></td>
              <td><input type="text" value="Unit" class="material-unit"></td>
              <td><input type="number" class="rate"></td>
              <td class="amount"></td>
              <td><input type="text" class="comment" placeholder="Details"></td>
              <td><button class="remove-material-row">Remove</button></td>
          `;
      installationMaterialsTable.querySelector('tbody').appendChild(newRow);
  
      // Add event listener to the new remove button
      newRow.querySelector('.remove-material-row').addEventListener('click', function() {
        this.closest('tr').remove();
        updateMaterialsTable();
      });
  
      // Add event listeners to the new row's quantity and rate inputs
      const quantityInput = newRow.querySelector('.material-quantity');
      const rateInput = newRow.querySelector('.rate');
      quantityInput.addEventListener('input', updateMaterialsTable);
      rateInput.addEventListener('input', updateMaterialsTable);
    }
  
    // --- Event Listeners ---
    // Event listener for calculate button
    calculateButton.addEventListener('click', handleCalculation);
  
    // Event listener for adding a new row to the appliance table
    addApplianceButton.addEventListener('click', function(event) {
      event.preventDefault();
      addApplianceRow();
    });
  
    // Event listener for removing a row from the appliance table
    applianceTable.addEventListener('click', function(event) {
      if (event.target.classList.contains('remove-row')) {
        event.target.closest('tr').remove();
        handleCalculation();
      }
    });
  
    // Event listener for adding a new material row
    addMaterialButton.addEventListener('click', function(event) {
      event.preventDefault();
      addMaterialRow();
    });
  
    // Event listener for removing a material row
    installationMaterialsTable.addEventListener('click', function(event) {
      if (event.target.classList.contains('remove-material-row')) {
        event.target.closest('tr').remove();
        updateMaterialsTable();
      }
    });
  
    // Event listeners for quotation table rates
    const rates = document.querySelectorAll('#quotation-table .rate'); // Target rates within quotation table
    rates.forEach(rateInput => {
      rateInput.addEventListener('input', updateQuotationTable);
    });
  
    // Event listeners for changes in battery type, panel wattage, and battery voltage
    batteryTypeSelect.addEventListener('change', handleCalculation);
    panelWattageSelect.addEventListener('change', handleCalculation);
    batteryVoltageSelect.addEventListener('change', handleCalculation);
    chargeControllerTypeSelect.addEventListener('change', handleCalculation);
    inverterTypeSelect.addEventListener('change', handleCalculation);
  
    // Event listeners for material quantities and rates
    const materialQuantities = document.querySelectorAll('.material-quantity');
    const materialRates = document.querySelectorAll('#installation-materials-table .rate'); // Target rates within the table
  
    materialQuantities.forEach(input => {
      input.addEventListener('input', updateMaterialsTable);
    });
  
    materialRates.forEach(input => {
      input.addEventListener('input', updateMaterialsTable);
    });
  
    calculationButton.addEventListener('click', function() {
      calculationModal.style.display = "block";
    });
  
    closeButton.addEventListener('click', function() {
      calculationModal.style.display = "none";
    });
  
    window.addEventListener('click', function(event) {
      if (event.target == calculationModal) {
        calculationModal.style.display = "none";
      }
    });
  
    // --- Initialization ---
    handleCalculation(); // Perform initial calculation
  });
  