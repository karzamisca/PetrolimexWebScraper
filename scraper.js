const express = require('express');
const { chromium } = require('playwright');
const cron = require('node-cron');
const cors = require('cors');

const app = express();
app.use(cors());

let scrapeData = [];

// Predefined Checking column values, in case of bad connection
const checkingValues = [
  'Xăng RON 95-V',
  'Xăng RON 95-III',
  'Xăng E5 RON 92-II',
  'DO 0,001S-V',
  'DO 0,05S-II',
  'Dầu hỏa 2-K'
];

// Function to scrape data
async function scrapePrices() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('https://www.petrolimex.com.vn/', { waitUntil: 'networkidle', timeout: 100000 });
    await page.waitForSelector('.header__pricePetrol .f-btn');
    await page.click('.header__pricePetrol .f-btn');
    await page.waitForSelector('.header__pricePetrol .f-list table');

    // Extract data from the table
    const priceData = await page.evaluate(() => {
      const rows = document.querySelectorAll('.header__pricePetrol .f-list table tbody tr');
      const result = [];

      rows.forEach(row => {
        const cols = row.querySelectorAll('td');
        const rowData = [];
        cols.forEach(col => rowData.push(col.innerText.trim()));
        result.push(rowData);
      });

      return result;
    });

    // Combine "Checking" column values with scraped data
    scrapeData = priceData.map((rowData, index) => [checkingValues[index] || 'N/A', ...rowData]);

    console.log('Scraped Data:', scrapeData);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
}

// Serve scraped data
app.get('/prices', (req, res) => {
  res.json({ data: scrapeData });
});

// Scraping every 30 seconds
cron.schedule('*/30 * * * * *', () => {
  console.log('Running scraping job...');
  scrapePrices();
});

// Initial scrape when the server starts
scrapePrices();

const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
