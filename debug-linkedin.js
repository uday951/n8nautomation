const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const COOKIE_PATH = path.resolve(__dirname, 'cookies.json');

async function debugLinkedIn() {
  let browser;
  try {
    console.log('🔍 Starting LinkedIn debug session...');
    
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

    browser = await chromium.launch({ 
      headless: false, // Show browser for debugging
      executablePath: executablePath || undefined
    });
    
    const context = await browser.newContext();
    const page = await context.newPage();

    if (fs.existsSync(COOKIE_PATH)) {
      const cookies = JSON.parse(fs.readFileSync(COOKIE_PATH));
      await context.addCookies(cookies);
      console.log('🍪 Loaded saved cookies');
    }

    console.log('🔐 Navigating to LinkedIn feed...');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'networkidle' });

    if (page.url().includes('/login')) {
      console.log('❌ Redirected to login - cookies may be expired');
      return;
    }

    console.log('✅ Successfully loaded LinkedIn feed');
    await page.waitForTimeout(5000);

    // Take a screenshot
    await page.screenshot({ path: 'linkedin-feed.png' });
    console.log('📸 Screenshot saved as linkedin-feed.png');

    // Find all buttons and their properties
    console.log('\n🔍 Analyzing page buttons...');
    const buttons = await page.$$('button');
    console.log(`Found ${buttons.length} buttons on the page`);

    const buttonInfo = [];
    for (let i = 0; i < buttons.length; i++) {
      try {
        const button = buttons[i];
        const text = await button.innerText();
        const ariaLabel = await button.getAttribute('aria-label');
        const className = await button.getAttribute('class');
        const id = await button.getAttribute('id');
        
        if (text || ariaLabel) {
          buttonInfo.push({
            index: i,
            text: text.trim(),
            ariaLabel,
            className,
            id
          });
        }
      } catch (e) {
        // Skip buttons that can't be analyzed
      }
    }

    // Save button analysis
    fs.writeFileSync('button-analysis.json', JSON.stringify(buttonInfo, null, 2));
    console.log('📄 Button analysis saved to button-analysis.json');

    // Show potential share buttons
    console.log('\n🎯 Potential share/post buttons:');
    buttonInfo.forEach(btn => {
      const text = btn.text.toLowerCase();
      const aria = (btn.ariaLabel || '').toLowerCase();
      
      if (text.includes('post') || text.includes('share') || 
          aria.includes('post') || aria.includes('share')) {
        console.log(`✅ ${btn.text} (aria: ${btn.ariaLabel})`);
      }
    });

    // Wait for user input
    console.log('\n⏳ Browser window is open. Please:');
    console.log('1. Look for any "Share" or "Post" buttons');
    console.log('2. Right-click and "Inspect Element" to see the HTML');
    console.log('3. Press Enter in this terminal when done...');

    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });

    await browser.close();
    console.log('✅ Debug session completed');

  } catch (error) {
    console.error('❌ Debug error:', error.message);
    if (browser) await browser.close();
  }
}

debugLinkedIn(); 