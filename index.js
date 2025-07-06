require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.send('✅ Puppeteer server is running!');
});

// LinkedIn POST route
app.post('/post', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: '❌ Missing post text' });
  }

  if (!process.env.LINKEDIN_EMAIL || !process.env.LINKEDIN_PASSWORD) {
    return res.status(500).json({ error: '❌ LinkedIn credentials not configured' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: await puppeteer.executablePath(),
      headless: 'new',
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
      ]
    });

    const page = await browser.newPage();
    
    // Set user agent to avoid detection
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // 1. Login to LinkedIn
    console.log('🔐 Logging into LinkedIn...');
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });
    
    // Wait for login form and fill credentials
    await page.waitForSelector('#username', { timeout: 10000 });
    await page.type('#username', process.env.LINKEDIN_EMAIL, { delay: 100 });
    await page.type('#password', process.env.LINKEDIN_PASSWORD, { delay: 100 });
    
    // Submit login form
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
    ]);

    // Check if login was successful
    const isLoggedIn = await page.evaluate(() => {
      return !document.querySelector('#username') && !document.querySelector('#password');
    });

    if (!isLoggedIn) {
      throw new Error('Login failed - check credentials');
    }

    console.log('✅ Successfully logged in');

    // 2. Navigate to feed and start creating a post
    console.log('📝 Navigating to feed...');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'networkidle2' });
    
    // Wait for and click the share button (try multiple selectors)
    const shareSelectors = [
      '.share-box-feed-entry__trigger',
      '[data-control-name="share.open"]',
      'button[aria-label*="Start a post"]',
      '.artdeco-button[aria-label*="post"]'
    ];

    let shareButton = null;
    for (const selector of shareSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        shareButton = await page.$(selector);
        if (shareButton) break;
      } catch (e) {
        continue;
      }
    }

    if (!shareButton) {
      throw new Error('Could not find share button');
    }

    await shareButton.click();
    console.log('✅ Opened post editor');

    // 3. Wait for editor and type post
    await page.waitForSelector('.ql-editor', { timeout: 10000 });
    await page.type('.ql-editor', text, { delay: 50 });
    console.log('✅ Typed post content');

    // 4. Click Post button (try multiple approaches)
    const postSelectors = [
      "//button[contains(text(), 'Post')]",
      "//button[contains(text(), 'Share')]",
      "//button[@aria-label*='Post']",
      "//button[@aria-label*='Share']"
    ];

    let postButton = null;
    for (const xpath of postSelectors) {
      try {
        const buttons = await page.$x(xpath);
        if (buttons.length > 0) {
          postButton = buttons[0];
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!postButton) {
      throw new Error("Post button not found");
    }

    await postButton.click();
    console.log('✅ Clicked post button');
    
    // Wait for post to be published
    await page.waitForTimeout(5000);

    await browser.close();
    return res.status(200).json({ 
      success: true, 
      message: '✅ Successfully posted to LinkedIn!' 
    });

  } catch (err) {
    console.error('❌ Error during LinkedIn automation:', err.message);
    
    if (browser) {
      await browser.close();
    }
    
    return res.status(500).json({
      error: 'Puppeteer failed to post',
      detail: err.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 POST /post - Create LinkedIn posts`);
  console.log(`🔍 GET / - Health check`);
});
