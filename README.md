# Fuel Prices Application

This application displays real-time fuel prices for different zones (Zone 1 and Zone 2) scraped from the **Petrolimex** website. It consists of three components:

1. **Frontend (HTML, CSS, JavaScript)** - Displays the prices in a table and renders a chart showing the price trends over time.
2. **Backend (Node.js + Playwright + Express)** - Scrapes the fuel prices from the website and serves the data through an API.
3. **Cron Job (Node.js + node-cron)** - Regularly scrapes the data from the source at defined intervals (every 30 seconds) to keep the data updated.

## 1. Frontend (HTML + JavaScript)

### **Frontend Overview**

The frontend consists of two main elements:
- A table to display the latest fuel prices for each type and zone.
- A dynamic chart using **Chart.js** to display the price history over time for each fuel type in both zones.

### **HTML File (frontend.html)**

This file defines the structure of the page with a table and a canvas for the chart:

- **Table**:
  - Displays the current fuel prices for different types and two zones (Zone 1 and Zone 2).
  - The table header has four columns: `Checking` (fuel type), `Type`, `Zone 1 Price`, and `Zone 2 Price`.

- **Chart**:
  - A line chart displays the price trends for Zone 1 and Zone 2 over time. It is implemented using **Chart.js** and is updated dynamically every 30 seconds.

### **JavaScript (script.js)**

This JavaScript file powers the frontend by fetching the latest prices from the backend and rendering the table and chart.

#### **Functions Explanation:**

- **`pricesHistory`**:
  - An object to store the price history for Zone 1 and Zone 2. It is structured as:
    ```js
    const pricesHistory = {
        zone1: {},
        zone2: {}
    };
    ```

- **`maxPoints`**:
  - Defines the maximum number of data points to store in the price history. Currently, it is set to `Infinity`, meaning no limit.

- **`loadPricesHistory`**:
  - Loads price history from `localStorage` (if available) to persist the chart data across page reloads. This ensures that price history is not lost if the page is refreshed.

- **`savePricesHistory`**:
  - Saves the current `pricesHistory` to `localStorage` to persist the data.

- **`fetchPrices`**:
  - Fetches fuel prices from the backend (`http://localhost:3000/prices`).
  - It also formats the current date and time using `toLocaleString()` to include both the date and time.
  - The fetched data is then used to update:
    - The **table**: It dynamically updates the table by adding new rows with the latest prices.
    - The **price history**: The fetched prices are pushed into the `pricesHistory` object for each fuel type.
    - The **chart**: The chart is updated with the new data.
  - Finally, the function calls `savePricesHistory()` to persist the updated price history in `localStorage`.

- **`updateChart`**:
  - Updates the chart with the latest price history.
  - **X-axis**: Shows the time (date + time) when prices were fetched.
  - **Y-axis**: Displays the price in VND.
  - Two datasets are created for each fuel type:
    - One for **Zone 1** (solid line).
    - One for **Zone 2** (dashed line).

- **`Chart.js Configuration`**:
  - The chart is configured to allow zooming and panning using the **Chart.js Zoom Plugin**. Users can zoom in on specific time periods using their mouse wheel and can pan through the chart using click-and-drag.

- **`setInterval(fetchPrices, 30000)`**:
  - This line ensures that the prices are fetched every 30 seconds (30,000 ms), so the data and chart are continuously updated.

## 2. Backend (Node.js + Express + Playwright)

### **Backend Overview**

The backend is responsible for scraping fuel prices from the **Petrolimex** website using **Playwright**. It exposes the scraped data through an API endpoint (`/prices`) that the frontend fetches to display the data.

### **`scraper.js`** (Node.js Backend)

#### **Key Libraries**:
- **Playwright**: Used to launch a browser, navigate to the website, and scrape the required data from the HTML elements.
- **Express**: A lightweight Node.js web framework used to create an API to serve the scraped data.
- **Cors**: Middleware to allow cross-origin resource sharing, enabling the frontend to make requests to the backend.
- **node-cron**: A scheduler to periodically run the web scraping function at regular intervals (every 30 seconds).

#### **Functions Explanation:**

- **`scrapeData`**:
  - An array that stores the latest scraped data in memory. This is what gets sent to the frontend when it requests the `/prices` endpoint.

- **`checkingValues`**:
  - An array of predefined values for the "Checking" column, which correspond to different fuel types like "Xăng RON 95-V" and "DO 0,001S-V".

- **`scrapePrices`**:
  - The main function responsible for scraping data from the **Petrolimex** website.
  - **Playwright** is used to launch a headless Chromium browser, navigate to the website, and extract data from the fuel prices table.
  - Scraped data is matched with the predefined `checkingValues` for the "Checking" column to create a complete data set.
  - The data is stored in `scrapeData` and is logged to the console for debugging.

- **`app.get('/prices', ...)`**:
  - This is the API endpoint that serves the scraped data to the frontend.
  - When the frontend makes a GET request to `/prices`, this function sends the `scrapeData` array as a JSON response.

- **`cron.schedule('*/30 * * * * *', ...)`**:
  - This sets up a cron job to run the `scrapePrices` function every 30 seconds.
  - The schedule `*/30 * * * * *` means "every 30 seconds", ensuring that the fuel prices are kept up-to-date.

## 3. Running the Application

### Prerequisites:
- **Node.js** installed on your system.
- **Playwright** for web scraping. You can install it using the command: 
  ```bash
  npm install playwright
  ```

### Steps to Run:

1. **Start the Backend (scraper)**:
   - Navigate to the folder containing `scraper.js`.
   - Run the following command to start the server:
     ```bash
     node scraper.js
     ```
   - This will start the server at `http://localhost:3000` and will begin scraping the fuel prices every 30 seconds.

2. **Start the Frontend**:
   - Open the `frontend.html` file in any modern browser.
   - The frontend will start fetching the latest fuel prices and display them in a table and a chart.
   - The chart will automatically update every 30 seconds.

### Notes:
- You can customize the scraping interval by modifying the cron job schedule in `scraper.js`.
- The application uses **localStorage** in the browser to persist the price history, so the chart data will remain even after refreshing the page.
