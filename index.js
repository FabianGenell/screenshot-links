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

const takeScreenshot = async (url) => {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 } // Width as specified, default height
    });
    const page = await context.newPage();

    try {
        console.log(`Taking screenshot of ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle' });

        // Extract domain for filename
        const urlObj = new URL(url);
        const domain = urlObj.hostname;

        // Create directory for domain if it doesn't exist
        const screenshotDir = path.join('./screenshots', domain);
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }

        // Save full-page screenshot
        const screenshotPath = path.join(screenshotDir, `${Date.now()}.png`);
        await page.screenshot({
            path: screenshotPath,
            fullPage: true // Auto-scrolls to capture full page
        });

        console.log(`✅ Screenshot saved to ${screenshotPath}`);
    } catch (error) {
        console.error(`❌ Error taking screenshot of ${url}:`, error);
    } finally {
        await browser.close();
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
        const tasks = urls.map((url) => limit(() => takeScreenshot(url)));
        await Promise.all(tasks);

        console.log('All screenshots completed!');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

main().catch(console.error);
