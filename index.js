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

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // 1. Login to LinkedIn
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });
    await page.type('#username', process.env.LINKEDIN_EMAIL, { delay: 50 });
    await page.type('#password', process.env.LINKEDIN_PASSWORD, { delay: 50 });
    await Promise.all([
      page.click('button[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);

    // 2. Open Feed and start creating a post
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.share-box-feed-entry__trigger');
    await page.click('.share-box-feed-entry__trigger');

    // 3. Wait for editor and type post
    await page.waitForSelector('.ql-editor');
    await page.type('.ql-editor', text, { delay: 30 });

    // 4. Click Post button
    const [postButton] = await page.$x("//button[contains(text(), 'Post')]");
    if (postButton) {
      await postButton.click();
      await page.waitForTimeout(3000);
    } else {
      throw new Error("Post button not found");
    }

    await browser.close();
    return res.status(200).json({ success: true, message: '✅ Successfully posted to LinkedIn!' });

  } catch (err) {
    console.error('❌ Error during LinkedIn automation:', err.message);
    return res.status(500).json({
      error: 'Puppeteer failed to post',
      detail: err.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
