# Screenshot Links

A Node.js ES6 script that takes full-page screenshots of multiple URLs using Playwright.

## Features

- Takes screenshots of multiple URLs in PNG format
- Saves screenshots in folders organized by domain
- Auto-scrolls to capture the full page
- Limits concurrency to avoid getting blocked
- Sets viewport width to 1440px
- Uses ES6 module syntax

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd screenshot-links

# Install dependencies
npm install

# Install Chromium browser
npm run install:browsers
```

## Usage

1. Edit the URLs in the `urls.json` file with your desired URLs
2. Run the script:

```bash
npm start
```

## Screenshot Location

Screenshots are saved in the `./screenshots/{domain}` folder, with filenames based on the timestamp.

## Customization

- Edit the viewport size in the `takeScreenshot` function
- Change the concurrency limit in the script by modifying the `CONCURRENCY_LIMIT` constant