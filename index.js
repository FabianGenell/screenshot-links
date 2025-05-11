import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import pLimit from 'p-limit';
import { fileURLToPath } from 'url';

// ES6 module support for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default config
let config = {
  viewport: { width: 1440, height: 900 },
  removeSelectors: [],
  waitBeforeScreenshot: 0,
  outputPath: './screenshots/[domain]/[name].png',
  concurrencyLimit: 3,
  retryCount: 3,
  timeout: 5000,
  fullPage: true,
  urls: []
};

// Read config from file
const CONFIG_FILE = './config.json';
// Load config if exists
if (fs.existsSync(CONFIG_FILE)) {
  const userConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
  config = { ...config, ...userConfig };
}

// Try to read URLs from urls.json if no URLs in config
let urls = config.urls || [];
if (urls.length === 0 && fs.existsSync('./urls.json')) {
  try {
    urls = JSON.parse(fs.readFileSync('./urls.json', 'utf8'));
  } catch (error) {
    console.warn('Failed to read urls.json:', error.message);
  }
}

// Set concurrency limit (3-5 recommended to avoid being blocked)
const CONCURRENCY_LIMIT = config.concurrencyLimit;
const limit = pLimit(CONCURRENCY_LIMIT);

const takeScreenshotWithRetry = async (url, retries = config.retryCount) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const browser = await chromium.launch();
            const context = await browser.newContext({
                viewport: config.viewport
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

                // Remove selectors if configured
                for (const selector of config.removeSelectors) {
                    try {
                        await page.evaluate((sel) => {
                            const elements = document.querySelectorAll(sel);
                            elements.forEach(el => el.style.display = 'none');
                        }, selector);
                    } catch (error) {
                        console.log(`Could not remove selector ${selector}: ${error.message}`);
                    }
                }

                // Wait before taking screenshot if configured
                if (config.waitBeforeScreenshot > 0) {
                    console.log(`Waiting ${config.waitBeforeScreenshot}ms before taking screenshot...`);
                    await page.waitForTimeout(config.waitBeforeScreenshot);
                }

                // Extract domain and name for filename
                const urlObj = new URL(url);
                const domain = urlObj.hostname;
                const name = urlObj.pathname.split('/').filter(Boolean).join('-') || 'index';

                // Parse the output path template
                let outputPath = config.outputPath
                    .replace('[domain]', domain)
                    .replace('[name]', name);

                // Ensure directory exists
                const dirPath = path.dirname(outputPath);
                if (!fs.existsSync(dirPath)) {
                    fs.mkdirSync(dirPath, { recursive: true });
                }

                // Save screenshot with timeout
                await Promise.race([
                    page.screenshot({
                        path: outputPath,
                        fullPage: config.fullPage
                    }),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Screenshot timeout')), config.timeout)
                    )
                ]);

                console.log(`✅ Screenshot saved to ${outputPath}`);
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
