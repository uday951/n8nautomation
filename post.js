require('dotenv').config();
const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ✅ Health check route
app.get('/', (req, res) => {
  res.send("✅ Puppeteer Server is running!");
});

app.post('/post', async (req, res) => {
  const postText = req.body.text;

  if (!postText) {
    return res.status(400).send({ error: 'Post text is required' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new', // ✅ This is crucial for Railway
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // ✅ Login to LinkedIn
    await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });

    await page.type('#username', process.env.LINKEDIN_EMAIL);
    await page.type('#password', process.env.LINKEDIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });

    // ✅ Post content
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'networkidle2' });
    await page.waitForSelector('.share-box-feed-entry__trigger');
    await page.click('.share-box-feed-entry__trigger');

    await page.waitForSelector('.ql-editor');
    await page.type('.ql-editor', postText);
    await page.waitForTimeout(1000);

    const [postButton] = await page.$x("//button[contains(text(), 'Post')]");
    if (postButton) {
      await postButton.click();
      await page.waitForTimeout(3000);
    }

    await browser.close();
    res.status(200).send({ success: true, message: '✅ Posted successfully!' });

  } catch (err) {
    console.error('❌ Error in Puppeteer flow:', err.message);
    res.status(500).send({ error: 'Failed to post to LinkedIn.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
