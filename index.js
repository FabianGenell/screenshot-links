import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import pLimit from 'p-limit';
import { fileURLToPath } from 'url';

// ES6 module support for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read URLs from file
const URL_FILE = './urls.json';
const urls = JSON.parse(fs.readFileSync(URL_FILE, 'utf8'));

// Set concurrency limit (3-5 recommended to avoid being blocked)
const CONCURRENCY_LIMIT = 3;
const limit = pLimit(CONCURRENCY_LIMIT);

const takeScreenshotWithRetry = async (url, retries = 3) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const browser = await chromium.launch();
            const context = await browser.newContext({
                viewport: { width: 1440, height: 900 }
            });
            const page = await context.newPage();

            try {
                console.log(`Taking screenshot of ${url}... (Attempt ${attempt}/${retries})`);
                await page.goto(url, { waitUntil: 'networkidle' });

                // Smooth scroll to trigger animations
                await page.evaluate(async () => {
                    await new Promise((resolve) => {
                        let totalHeight = 0;
                        const distance = 100;
                        const timer = setInterval(() => {
                            const scrollHeight = document.body.scrollHeight;
                            window.scrollBy(0, distance);
                            totalHeight += distance;

                            if (totalHeight >= scrollHeight) {
                                clearInterval(timer);
                                window.scrollTo(0, 0);
                                resolve();
                            }
                        }, 100);
                    });
                });

                // Extract domain for filename
                const urlObj = new URL(url);
                const domain = urlObj.hostname;
                const filename = urlObj.pathname.split('/').filter(Boolean).join('-') || 'index';

                // Create directory for domain if it doesn't exist
                const screenshotDir = path.join('./screenshots', domain);
                if (!fs.existsSync(screenshotDir)) {
                    fs.mkdirSync(screenshotDir, { recursive: true });
                }

                // Save full-page screenshot with timeout
                const screenshotPath = path.join(screenshotDir, `${filename}.png`);
                await Promise.race([
                    page.screenshot({
                        path: screenshotPath,
                        fullPage: true
                    }),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Screenshot timeout')), 5000)
                    )
                ]);

                console.log(`✅ Screenshot saved to ${screenshotPath}`);
                return true; // Success
            } catch (error) {
                console.error(`❌ Error on attempt ${attempt}:`, error.message);
                if (attempt === retries) {
                    throw error; // Rethrow if this was the last attempt
                }
            } finally {
                await browser.close();
            }
        } catch (error) {
            if (attempt === retries) {
                throw error; // Rethrow if this was the last attempt
            }
            // Wait a bit before retrying
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
};

const main = async () => {
    try {
        if (!Array.isArray(urls) || urls.length === 0) {
            console.error('The URL file must contain a non-empty array of URLs');
            process.exit(1);
        }

        console.log(
            `Starting screenshot process for ${urls.length} URLs with concurrency limit of ${CONCURRENCY_LIMIT}`
        );

        // Process URLs with concurrency limit
        const tasks = urls.map((url) => limit(() => takeScreenshotWithRetry(url)));
        await Promise.all(tasks);

        console.log('All screenshots completed!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

main().catch(console.error);
