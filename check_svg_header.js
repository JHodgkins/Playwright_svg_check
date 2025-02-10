const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
    const urls = JSON.parse(fs.readFileSync('urls.json', 'utf-8'));
    const browser = await chromium.launch();
    
    // Set concurrency limit (adjust based on system performance)
    const CONCURRENCY_LIMIT = 6;  
    const chunks = [];

    // Split URLs into chunks based on concurrency limit
    for (let i = 0; i < urls.length; i += CONCURRENCY_LIMIT) {
        chunks.push(urls.slice(i, i + CONCURRENCY_LIMIT));
    }

    const results = [];
    let passedCount = 0;
    let failedCount = 0;
    const startTime = Date.now();
    
    for (const chunk of chunks) {
        const pageChecks = chunk.map(async (url) => {
            const page = await browser.newPage();
            try {
                await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
                const svgExists = await page.evaluate(() => {
                    const header = document.querySelector('header');
                    return header ? header.querySelector('svg') !== null : false;
                });

                if (svgExists) {
                    passedCount++;
                    results.push({ url, status: "Header OK" });
                } else {
                    failedCount++;
                    results.push({ url, status: "Check page" });
                }
            } catch (error) {
                failedCount++;
                results.push({ url, status: `Error: ${error.message}` });
            } finally {
                await page.close();
            }
        });

        await Promise.all(pageChecks); // Process chunk concurrently
    }

    await browser.close();
    const endTime = Date.now();
    const timeTaken = ((endTime - startTime) / 1000).toFixed(2); // Time in seconds

    // Save results
    const date = new Date().toLocaleDateString('en-GB').split('/').join('-'); // Format DD-MM-YYYY
    const outputDir = path.join(__dirname, `Header check ${date}`);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const outputPath = path.join(outputDir, 'results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), 'utf-8');

    console.log(`Results saved to: ${outputPath}`);
    console.log(`Time taken: ${timeTaken} seconds`);
    console.log(`Passed: ${passedCount}, Failed: ${failedCount}`);
})();
