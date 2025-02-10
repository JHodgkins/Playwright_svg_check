const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');

// Define the file paths
const inputFilePath = path.join(__dirname, 'urls', 'urls.xlsx');
const outputFilePath = path.join(__dirname, 'URLS.json');

// Read the Excel file
const workbook = xlsx.readFile(inputFilePath);
const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
const worksheet = workbook.Sheets[sheetName];

// Convert sheet to JSON format
const jsonData = xlsx.utils.sheet_to_json(worksheet);

// Extract URLs from the "URLS" column
const urls = jsonData.map(row => row.URLS).filter(url => typeof url === 'string');

// Save the extracted URLs to a JSON file
fs.writeFileSync(outputFilePath, JSON.stringify(urls, null, 2), 'utf-8');

console.log(`Extracted ${urls.length} URLs and saved to ${outputFilePath}`);
