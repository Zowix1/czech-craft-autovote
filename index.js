require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');

const { executablePath } = require('puppeteer');

puppeteer.use(
  RecaptchaPlugin({
    provider: { id: '2captcha', token: process.env.API_KEY },
  })
);

const fs = require('fs');
const content = fs.readFileSync('config.json', 'utf8');
const config = JSON.parse(content);
const time = 2 * 60 * 60 * 1000 + 2 * 60 * 1000; // 2 hodiny a 2 minuty

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    slowMo: 20,
    executablePath: executablePath(),
  });
  const page = await browser.newPage();

  const vote = async () => {
    console.log('Starting voting process...');

    await page.goto(config.page_url);

    const alert = await page.$x(config.alert_xpath);
    const text = alert.length && (await page.evaluate((el) => el.textContent, alert[0]));
    if (text === 'Již si hlasoval!') {
      console.log('Failed to vote!');
      return;
    }

    const usernameInput = await page.$x(config.username_xpath);
    await usernameInput[0].type(config.username);

    const checkbox = await page.$x(config.checkbox_xpath);
    await checkbox[0].click();

    const { solved, error } = await page.solveRecaptchas();

    if (solved) {
      const button = await page.$x(config.button_xpath);
      await button[0].click();
      console.log('Successfully voted!');
    }

    error && console.log('Failed to bypass captcha!');
  };

  await vote();

  setInterval(vote, time);

  // await browser.close();
})();
