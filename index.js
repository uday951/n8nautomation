require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ Playwright server is running!');
});

app.post('/post', async (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: '❌ Missing post text' });

  if (!process.env.LINKEDIN_EMAIL || !process.env.LINKEDIN_PASSWORD) {
    return res.status(500).json({ error: '❌ LinkedIn credentials not configured' });
  }

  let browser;

  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
    });

    const page = await context.newPage();

    console.log('🔐 Logging into LinkedIn...');
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle' });

    await page.fill('#username', process.env.LINKEDIN_EMAIL);
    await page.fill('#password', process.env.LINKEDIN_PASSWORD);
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle' })
    ]);

    if (await page.locator('#username').count() > 0) {
      throw new Error('Login failed — check credentials');
    }

    console.log('✅ Logged in. Navigating to feed...');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'networkidle' });

    const shareSelectors = [
      '.share-box-feed-entry__trigger',
      '[data-control-name="share.open"]',
      'button[aria-label*="Start a post"]'
    ];

    let found = false;
    for (const sel of shareSelectors) {
      const btn = page.locator(sel);
      if (await btn.count()) {
        await btn.first().click();
        found = true;
        break;
      }
    }

    if (!found) throw new Error('❌ Could not find Share button');

    console.log('✅ Post editor opened');
    await page.waitForSelector('.ql-editor', { timeout: 10000 });
    await page.type('.ql-editor', text, { delay: 50 });

    const postButtons = await page.$$('button');
    let clicked = false;
    for (const btn of postButtons) {
      const label = await btn.innerText();
      if (label.includes('Post') || label.includes('Share')) {
        await btn.click();
        clicked = true;
        break;
      }
    }

    if (!clicked) throw new Error('❌ Could not find Post/Share button');

    console.log('✅ Post submitted');
    await page.waitForTimeout(5000);
    await browser.close();

    return res.status(200).json({ success: true, message: '✅ Successfully posted to LinkedIn!' });

  } catch (err) {
    console.error('❌ Automation failed:', err.message);
    if (browser) await browser.close();
    return res.status(500).json({
      error: '❌ LinkedIn automation failed',
      detail: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Playwright server running on port ${PORT}`);
});
