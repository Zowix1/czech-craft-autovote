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
  console.log('Starting voting process...');
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 20,
    executablePath: executablePath(),
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  const detectError = async () => {
    const alert = await page.$(config.alert_class);
    return alert;
  };

  const vote = async () => {
    console.log(`----------\nTrying to vote... - ${getDate(config.utc_minutes_offset || 0)}`);

    await page.goto(config.page_url);

    if (await detectError()) {
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

      await page.waitForNavigation();

      if (await detectError()) {
        console.log('Failed to vote!');
        return;
      }

      console.log('Successfully voted!');
    }

    error && console.log('Failed to bypass captcha!');
  };

  await vote();

  setInterval(vote, time);

  // await browser.close();
})();

function getDate(offset) {
  let date = new Date();

  offset && (date = new Date(date.getTime() + offset * 60 * 1000));

  return date.toUTCString();
}
