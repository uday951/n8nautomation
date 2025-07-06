require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const app = express();
const PORT = process.env.PORT || 3000;
const COOKIE_PATH = path.resolve(__dirname, 'cookies.json');

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('✅ Playwright server is running!');
});

app.post('/post', async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: '❌ Missing post text' });
  let browser;
  try {
    // Use system Chrome if available
    const chromePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      process.env.CHROME_PATH
    ].filter(Boolean);
    let executablePath = null;
    for (const p of chromePaths) {
      if (fs.existsSync(p)) {
        executablePath = p;
        break;
      }
    }
    browser = await chromium.launch({ headless: true, executablePath: executablePath || undefined });
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
    });
    if (fs.existsSync(COOKIE_PATH)) {
      const cookies = JSON.parse(fs.readFileSync(COOKIE_PATH));
      await context.addCookies(cookies);
    }
    const page = await context.newPage();
    console.log('🔐 Navigating to LinkedIn feed...');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'networkidle' });
    if (page.url().includes('/login')) {
      throw new Error('❌ Session expired or not authenticated. Please re-login and update cookies.');
    }
    await page.waitForTimeout(4000);
    // Try to find and click any button that could be "Share"/"Post"
    const possibleWords = ['post', 'share', 'start', 'create'];
    let shareButtonFound = false;
    let attempts = 0;
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      let text = '';
      let aria = '';
      try {
        text = (await btn.innerText()).toLowerCase();
      } catch {}
      try {
        aria = ((await btn.getAttribute('aria-label')) || '').toLowerCase();
      } catch {}
      if (possibleWords.some(w => text.includes(w) || aria.includes(w))) {
        console.log(`🔍 Trying button: text="${text}", aria-label="${aria}"`);
        try {
          await btn.click({ timeout: 2000 });
          shareButtonFound = true;
          console.log('✅ Clicked a possible share/post button!');
          break;
        } catch (e) {
          console.log(`⚠️  Failed to click: ${e.message}`);
        }
      }
      attempts++;
    }
    // If not found, try again after a short wait (sometimes UI loads late)
    if (!shareButtonFound) {
      console.log('⏳ Retrying after wait...');
      await page.waitForTimeout(4000);
      const buttons2 = await page.$$('button');
      for (const btn of buttons2) {
        let text = '';
        let aria = '';
        try {
          text = (await btn.innerText()).toLowerCase();
        } catch {}
        try {
          aria = ((await btn.getAttribute('aria-label')) || '').toLowerCase();
        } catch {}
        if (possibleWords.some(w => text.includes(w) || aria.includes(w))) {
          console.log(`🔍 Retrying button: text="${text}", aria-label="${aria}"`);
          try {
            await btn.click({ timeout: 2000 });
            shareButtonFound = true;
            console.log('✅ Clicked a possible share/post button (retry)!');
            break;
          } catch (e) {
            console.log(`⚠️  Retry failed to click: ${e.message}`);
          }
        }
      }
    }
    if (!shareButtonFound) {
      await page.screenshot({ path: 'linkedin-debug.png' });
      throw new Error('❌ Could not find Share/Post button. Screenshot saved as linkedin-debug.png');
    }
    // Wait for editor and type post
    await page.waitForSelector('.ql-editor', { timeout: 10000 });
    await page.type('.ql-editor', text, { delay: 50 });
    // Try to find and click any button that could be "Post"/"Share" in the editor
    let postButtonClicked = false;
    const postButtons = await page.$$('button');
    for (const btn of postButtons) {
      let text = '';
      let aria = '';
      try {
        text = (await btn.innerText()).toLowerCase();
      } catch {}
      try {
        aria = ((await btn.getAttribute('aria-label')) || '').toLowerCase();
      } catch {}
      if (possibleWords.some(w => text.includes(w) || aria.includes(w))) {
        console.log(`🔍 Trying post/share button: text="${text}", aria-label="${aria}"`);
        try {
          await btn.click({ timeout: 2000 });
          postButtonClicked = true;
          console.log('✅ Clicked a possible post/share button!');
          break;
        } catch (e) {
          console.log(`⚠️  Failed to click post/share: ${e.message}`);
        }
      }
    }
    if (!postButtonClicked) {
      await page.screenshot({ path: 'linkedin-debug-post.png' });
      throw new Error('❌ Could not find Post/Share button in editor. Screenshot saved as linkedin-debug-post.png');
    }
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
