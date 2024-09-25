const pricesHistory = {
    zone1: {},
    zone2: {}
};

// Remove the limit on data points to store full history
const maxPoints = Infinity;  // No limit on data points

// Load prices history from localStorage if available
function loadPricesHistory() {
    const storedHistory = localStorage.getItem('pricesHistory');
    if (storedHistory) {
        const parsedHistory = JSON.parse(storedHistory);
        Object.assign(pricesHistory.zone1, parsedHistory.zone1 || {});
        Object.assign(pricesHistory.zone2, parsedHistory.zone2 || {});
    }
}

// Save prices history to localStorage
function savePricesHistory() {
    localStorage.setItem('pricesHistory', JSON.stringify(pricesHistory));
}

async function fetchPrices() {
    try {
        const response = await fetch('http://localhost:3000/prices');
        const result = await response.json();
        const data = result.data;
        const tableBody = document.querySelector('#pricesTable tbody');
        const now = new Date().toLocaleString();  // Get current date and time for the graph

        tableBody.innerHTML = ''; // Clear existing rows

        // Populate table with new data and update graph
        data.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach((cell, index) => {
                if (index < 4) {  // First 4 values correspond to Checking, Type, Zone 1, Zone 2
                    const td = document.createElement('td');
                    td.textContent = cell;
                    tr.appendChild(td);
                }
            });
            tableBody.appendChild(tr);

            // Get price information for each zone
            const priceType = row[0];  // 'Checking' value
            const zone1Price = parseFloat(row[2].replace(/[^\d.-]/g, ''));  // Zone 1 price
            const zone2Price = parseFloat(row[3].replace(/[^\d.-]/g, ''));  // Zone 2 price

            if (!pricesHistory.zone1[priceType]) {
                pricesHistory.zone1[priceType] = [];
                pricesHistory.zone2[priceType] = [];
            }

            // Add the new prices with the current date and time
            pricesHistory.zone1[priceType].push({ time: now, price: zone1Price });
            pricesHistory.zone2[priceType].push({ time: now, price: zone2Price });
        });

        savePricesHistory();  // Save the updated prices history to localStorage
        updateChart();
    } catch (error) {
        console.error('Error fetching prices:', error);
    }
}

// Chart.js configuration with zoom and pan enabled
const ctx = document.getElementById('fuelPriceChart').getContext('2d');
const chartConfig = {
    type: 'line',
    data: {
        labels: [], // Time labels (Date + Time) will go here
        datasets: []
    },
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'Fuel Prices Over Time (Zone 1 and Zone 2)'
            },
            zoom: {
                zoom: {
                    wheel: {
                        enabled: true, // Enable zooming with the mouse wheel
                    },
                    pinch: {
                        enabled: true, // Enable zooming on touch screens
                    },
                    mode: 'x',  // Only allow zooming in the x (time) direction
                },
                pan: {
                    enabled: true,
                    mode: 'x',  // Only allow panning in the x (time) direction
                }
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Date and Time'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Price (VND)'
                }
            }
        }
    }
};

const fuelPriceChart = new Chart(ctx, chartConfig);

function updateChart() {
    const labels = Object.values(pricesHistory.zone1)[0]?.map(point => point.time) || [];
    fuelPriceChart.data.labels = labels; // Update time labels with date and time

    // Combine Zone 1 and Zone 2 datasets for each fuel type
    fuelPriceChart.data.datasets = [];

    Object.keys(pricesHistory.zone1).forEach((priceType, index) => {
        // Zone 1 line for this fuel type
        fuelPriceChart.data.datasets.push({
            label: `${priceType} (Zone 1)`,
            data: pricesHistory.zone1[priceType].map(point => point.price),
            fill: false,
            borderColor: `hsl(${index * 60}, 100%, 50%)`, // Different color for each line
            tension: 0.1
        });

        // Zone 2 line for this fuel type
        fuelPriceChart.data.datasets.push({
            label: `${priceType} (Zone 2)`,
            data: pricesHistory.zone2[priceType].map(point => point.price),
            fill: false,
            borderColor: `hsl(${index * 60 + 30}, 100%, 50%)`, // Slightly different color for Zone 2
            tension: 0.1,
            borderDash: [5, 5]  // Dashed line for Zone 2
        });
    });

    fuelPriceChart.update(); // Redraw the chart with new data
}

// Load previous prices history and initialize chart
loadPricesHistory();
updateChart();

// Fetch prices on page load
fetchPrices();

// Refresh prices and update chart every 30 seconds
setInterval(fetchPrices, 30000); // 30 seconds
