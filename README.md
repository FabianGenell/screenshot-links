# Screenshot Links

A Node.js ES6 script that takes screenshots of multiple URLs using Playwright with extensive configuration options.

## Features

- Takes screenshots of multiple URLs in PNG format
- Configurable viewport size and full page vs. viewport-only screenshots
- Ability to remove/hide unwanted elements (cookie banners, popups, etc.)
- Custom wait time before capturing screenshots
- Flexible output path configuration
- Auto-scrolls to trigger animations
- Limits concurrency to avoid getting blocked
- Uses ES6 module syntax
- Automatic retry mechanism for failed screenshots
- Configurable timeout for each screenshot attempt

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

1. Provide URLs in one of two ways:
   - Add them to the `urls` array in `config.json` (recommended)
   - Or create a separate `urls.json` file with an array of URLs
2. Customize settings in `config.json` (will be created with defaults if not present)
3. Run the script:

```bash
npm start
```

## Configuration

Create a `config.json` file in the root directory with the following options:

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
  "waitBeforeScreenshot": 1000,
  "outputPath": "./screenshots/[domain]/[name].png",
  "concurrencyLimit": 3,
  "retryCount": 3,
  "timeout": 5000,
  "fullPage": true,
  "urls": [
    "https://example.com",
    "https://example.org"
  ]
}
```

### Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `viewport` | Set the width and height of the browser viewport | `{ width: 1440, height: 900 }` |
| `removeSelectors` | Array of CSS selectors to hide before taking screenshot | `[]` |
| `waitBeforeScreenshot` | Time in milliseconds to wait before capturing | `0` |
| `outputPath` | Template for file paths with `[domain]` and `[name]` placeholders | `./screenshots/[domain]/[name].png` |
| `concurrencyLimit` | How many URLs to process simultaneously | `3` |
| `retryCount` | Number of retry attempts for failed screenshots | `3` |
| `timeout` | Screenshot capture timeout in milliseconds | `5000` |
| `fullPage` | Whether to capture the entire page (`true`) or just the viewport (`false`) | `true` |
| `urls` | Array of URLs to capture screenshots of | `[]` |

## Examples

### Mobile Screenshot

```json
{
  "viewport": {
    "width": 390,
    "height": 844
  },
  "fullPage": false
}
```

### Remove Cookie Banners and Ads

```json
{
  "removeSelectors": [
    ".cookie-banner",
    ".newsletter-popup",
    ".ads",
    "#shopify-pc__banner"
  ]
}
```

### Custom Output Path

```json
{
  "outputPath": "./screenshots/portfolio/[domain].png"
}
```