// save-cookies.js
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const COOKIE_PATH = path.resolve(__dirname, 'cookies.json');

async function saveCookies() {
  let browser;
  try {
    console.log('🚀 Launching browser...');
    
    // Try to use system Chrome first
    const chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.CHROME_PATH
    ].filter(Boolean);

    let executablePath = null;
    for (const path of chromePaths) {
      if (fs.existsSync(path)) {
        executablePath = path;
        console.log(`✅ Found Chrome at: ${path}`);
        break;
      }
    }

    if (!executablePath) {
      console.log('⚠️  Chrome not found in standard locations. Trying Playwright Chromium...');
    }

    browser = await chromium.launch({ 
      headless: false,
      executablePath: executablePath || undefined
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('🔐 Navigating to LinkedIn login...');
    await page.goto('https://www.linkedin.com/login');

    console.log('📝 Please login manually in the browser window...');
    console.log('⏳ Waiting for you to complete login...');
    
    // Wait for user to login manually
    await page.waitForURL('**/feed/**', { timeout: 300000 }); // 5 minutes timeout
    
    console.log('✅ Login detected! Saving cookies...');
    
    // Get cookies
    const cookies = await context.cookies();
    
    // Save cookies to file
    fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2));
    
    console.log('💾 Cookies saved successfully!');
    console.log(`📁 Location: ${COOKIE_PATH}`);
    
    await browser.close();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (browser) await browser.close();
  }
}

saveCookies();
