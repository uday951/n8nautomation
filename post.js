require('dotenv').config();
const puppeteer = require('puppeteer');

const postText = process.argv[2];

(async () => {
  const browser = await puppeteer.launch({ headless: false });
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
})();
