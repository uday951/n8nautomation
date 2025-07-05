require('dotenv').config();
const puppeteer = require('puppeteer');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/post', async (req, res) => {
  const postText = req.body.text;

  if (!postText) {
    return res.status(400).send({ error: 'Post text is required' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto('https://www.linkedin.com/login');

    await page.type('#username', process.env.LINKEDIN_EMAIL);
    await page.type('#password', process.env.LINKEDIN_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    await page.goto('https://www.linkedin.com/feed/');
    await page.waitForSelector('.share-box-feed-entry__trigger');
    await page.click('.share-box-feed-entry__trigger');

    await page.waitForSelector('.ql-editor');
    await page.type('.ql-editor', postText);
    await page.waitForTimeout(1000);

    const [postBtn] = await page.$x("//button[contains(text(), 'Post')]");
    if (postBtn) {
      await postBtn.click();
      console.log("✅ Post published successfully!");
    } else {
      console.log("❌ Could not find Post button.");
    }

    await page.waitForTimeout(3000);
    await browser.close();

    res.status(200).send({ success: true, message: "Post successful!" });

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send({ error: "Failed to post" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
