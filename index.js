require('dotenv').config();
const puppeteer = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');

const { executablePath } = require('puppeteer');

puppeteer.use(
  RecaptchaPlugin({
    provider: { id: '2captcha', token: process.env.API_KEY },
  })
);

const fetch = require('node-fetch');
const getVotingIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    if (response.ok) {
      const { ip } = await response.json();
      return ip;
    }
    throw new Error('Failed to obtain public IP');
  } catch (err) {
    return err || err.message || 'Failed to obtain public IP';
  }
};

const fs = require('fs');
const content = fs.readFileSync('config.json', 'utf8');
const config = JSON.parse(content);
const time = Math.max(config.vote_minutes_inteval, 122) * 60 * 1000;

(async () => {
  console.log(`
 _______  _______             _______  __   __  _______  _______  __   __  _______  _______  _______ 
 |       ||       |           |   _   ||  | |  ||       ||       ||  | |  ||       ||       ||       |
 |       ||       |   ____    |  |_|  ||  | |  ||_     _||   _   ||  |_|  ||   _   ||_     _||    ___|
 |       ||       |  |____|   |       ||  |_|  |  |   |  |  | |  ||       ||  | |  |  |   |  |   |___ 
 |      _||      _|           |       ||       |  |   |  |  |_|  ||       ||  |_|  |  |   |  |    ___|
 |     |_ |     |_            |   _   ||       |  |   |  |       | |     | |       |  |   |  |   |___ 
 |_______||_______|           |__| |__||_______|  |___|  |_______|  |___|  |_______|  |___|  |_______|
 
                                                                                      by Zowix
  `);
  console.log(
    `Starting voting process...\n  Voting every ${time / 60 / 1000} minutes\n  Username: ${
      config.username
    }\n  Server: ${config.page_url}\n  Currently voting from address:\n    ${await getVotingIP()}`
  );
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 20,
    executablePath: executablePath(),
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();

  const detectError = async () => {
    const alert = await page.$(config.alert_class);
    if (!alert) return false;
    const textContent = await alert.getProperty('textContent');
    const text = await textContent.jsonValue();
    return text || 'unknown error';
  };

  const detectSuccess = async () => {
    const success = await page.$(config.success_class);
    return success;
  };

  const detect500 = async () => {
    const [internalErr] = await page.$x(config.internal_xpath);

    if (!internalErr) return false;

    const textContent = await internalErr.getProperty('textContent');
    const text = await textContent.jsonValue();

    if (text.toLowerCase().includes('internal server error')) return true;

    return false;
  };

  const vote = async () => {
    console.log(`----------\nTrying to vote - ${getDate(config.utc_minutes_offset || 0)}`);

    await page.goto(config.page_url);

    if (await detect500()) {
      console.log('   The website seems to be down.');
      return;
    }

    const loadError = await detectError();
    if (loadError) {
      console.log(`   Failed to vote!\n    Reason:\n     ${loadError}`);
      return;
    }

    const [usernameInput] = await page.$x(config.username_xpath);
    if (!usernameInput) {
      console.log('   Failed to find username input field!');
      if (await detect500()) console.log('   The website seems to be down.');
      return;
    }
    await usernameInput.type(config.username);

    const [checkbox] = await page.$x(config.checkbox_xpath);
    if (!checkbox) {
      console.log('   Failed to find privacy checkbox!');
      if (await detect500()) console.log('   The website seems to be down.');
      return;
    }
    await checkbox.click();

    console.log('   Solving captcha...');
    const { solved, error } = await page.solveRecaptchas();

    if (solved) {
      const [button] = await page.$x(config.button_xpath);
      await button.click();

      await page.waitForNavigation();

      if (await detect500()) {
        console.log('   Cannot confirm vote status.\n    The website seems to be down.');
        return;
      }

      const hasError = await detectError();
      if (hasError) {
        console.log(`   Failed to vote!\n    Reason:\n     ${hasError}`);
        return;
      }

      if (await detectSuccess()) {
        console.log('   Successfully voted!');
        return;
      }

      console.log('   Something went wrong');
    }

    error && console.log('   Failed to bypass captcha!');
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
