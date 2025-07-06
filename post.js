require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 3000;

// Health check
app.get('/', (req, res) => {
  res.send('✅ Puppeteer server running');
});

app.post('/post', async (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: 'Missing post text' });

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });

    await page.type('#username', process.env.LINKEDIN_EMAIL);
    await page.type('#password', process.env.LINKEDIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.share-box-feed-entry__trigger', { timeout: 10000 });
    await page.click('.share-box-feed-entry__trigger');

    await page.waitForSelector('.ql-editor', { timeout: 10000 });
    await page.type('.ql-editor', text);

    const [postButton] = await page.$x("//button[contains(text(), 'Post')]");
    if (postButton) {
      await postButton.click();
      await page.waitForTimeout(3000);
    } else {
      throw new Error("Post button not found");
    }

    await browser.close();
    res.status(200).json({ success: true, message: '✅ Posted to LinkedIn' });
  } catch (error) {
    console.error('❌ Error in Puppeteer:', error.message);
    res.status(500).json({ error: 'Puppeteer failed', detail: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
