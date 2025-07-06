const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function verifySetup() {
  console.log('🔍 Verifying LinkedIn automation setup...');
  
  try {
    // Check if Playwright is installed
    console.log('✅ Playwright is installed');
    
    // Try to launch browser
    console.log('🌐 Testing browser launch...');
    const browser = await chromium.launch({ headless: true });
    console.log('✅ Browser launched successfully');
    
    // Test a simple page
    const page = await browser.newPage();
    await page.goto('https://example.com');
    const title = await page.title();
    console.log(`✅ Page loaded: ${title}`);
    
    await browser.close();
    console.log('✅ Browser closed successfully');
    
    // Check for cookies file
    const cookiePath = path.resolve(__dirname, 'cookies.json');
    if (fs.existsSync(cookiePath)) {
      console.log('✅ LinkedIn cookies found');
    } else {
      console.log('⚠️  LinkedIn cookies not found - run: npm run save-cookies');
    }
    
    console.log('\n🎉 Setup verification complete!');
    console.log('📝 Next steps:');
    console.log('1. If cookies missing: npm run save-cookies');
    console.log('2. Start server: npm start');
    console.log('3. Test automation: npm test');
    
  } catch (error) {
    console.error('❌ Setup verification failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Run: npm install');
    console.log('2. Run: npx playwright install chromium');
    console.log('3. Try again: node verify-setup.js');
  }
}

verifySetup(); 