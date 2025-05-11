# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Screenshot Links is a Node.js ES6 script that takes full-page screenshots of multiple URLs using Playwright. The script handles:
- Taking screenshots in PNG format from URLs listed in urls.json
- Saving screenshots in folders organized by domain
- Auto-scrolling to capture full pages and trigger animations
- Limited concurrency to avoid being blocked by websites
- Automatic retry mechanism for failed screenshots

## Commands

### Running the Application
- `npm start` - Run the screenshot script

### Installation
- `npm install` - Install project dependencies
- `npm run install:browsers` - Install Chromium browser required by Playwright

## Project Structure

- `index.js` - Main script file containing all the screenshot functionality
- `config.json` - Contains all configuration options including URLs (preferred method)
- `urls.json` - Optional file that can contain an array of URLs to capture screenshots of
- `screenshots/` - Directory where screenshots are saved, organized by domain

## Key Components

1. **URL Processing**: URLs are read from config.json or urls.json and processed with limited concurrency
2. **Screenshot Function**: The `takeScreenshotWithRetry` function handles:
   - Browser initialization
   - Page navigation and scrolling
   - File naming based on URL structure
   - Screenshot capture with timeout protection
   - Retry logic for failed attempts

## Configuration Options

Configuration options are now available in the `config.json` file:

```json
{
  "viewport": {
    "width": 1440,
    "height": 900
  },
  "removeSelectors": [
    ".cookie-banner",
    ".newsletter-popup",
    ".ads"
  ],
  "waitBeforeScreenshot": 10000,
  "outputPath": "./screenshots/[domain]/[name].png",
  "concurrencyLimit": 3,
  "retryCount": 3,
  "timeout": 5000
}
```

- `viewport`: Set the viewport dimensions for screenshots
- `removeSelectors`: Array of CSS selectors to hide before taking screenshots
- `waitBeforeScreenshot`: Time in milliseconds to wait before capturing the screenshot
- `outputPath`: Template for the screenshot file path with `[domain]` and `[name]` placeholders
- `concurrencyLimit`: Controls how many URLs are processed simultaneously (default: 3)
- `retryCount`: Number of retry attempts for failed screenshots (default: 3)
- `timeout`: Screenshot capture timeout in milliseconds (default: 5000)
- `fullPage`: When true, captures the full scrollable page; when false, only captures the viewport (default: true)