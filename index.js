const puppeteer = require('puppeteer');

/* TODO
 * CLI Args:
 *  - username
 *  - password
 *  - cloud/local
 *      - Character select
 *  - headless/headful
 *  - event name
 *
 */

const username = '';
const password = '';

(async () => {
  const options = {
    headless: false,
    defaultViewport: {
      width: 2560 / 2,
      height: 1440,
    },
    devtools: true,
  };
  const browser = await puppeteer.launch(options);
  const page = (await browser.pages())[0];

  await page.goto('https://melvoridle.com/cloud/login.php');
  await login(page);
  await acceptConditions(page);
  await showCloudSaves(page);
  await chooseCharacter(page, 0);

  await browser.close();
})();

/**
 *
 * @param {puppeteer.Page} page
 * @param {string} selector - A selector to click on to cause a navigation.
 * @param {object} options - Navigation parameters.
 */
async function navigate(page, selector, options) {
  return Promise.all([page.waitForNavigation(options), page.click(selector)]);
}

/**
 *
 * @param {puppeteer.Page} page
 */
async function login(page) {
  const usernameXPath = '//input[@id="login-username"]';
  /** @type {puppeteer.ElementHandle} */
  const usernameInput = (await page.$x(usernameXPath))[0];
  await usernameInput.type(username);

  const passwordXPath = '//input[@id="login-password"]';
  /** @type {puppeteer.ElementHandle} */
  const passwordInput = (await page.$x(passwordXPath))[0];
  await passwordInput.type(password);

  return navigate(page, '#login');
}
/**
 *
 * @param {puppeteer.Page} page
 */
async function acceptConditions(page) {
  return page.evaluate(() => {
    agreeToNotice(0);
  });
}

/**
 *
 * @param {puppeteer.Page} page
 */
async function showCloudSaves(page) {
  const saveXPath =
    '//button[@id="character-selection-toggle" and contains(text(), "Show Cloud Saves")]';
  /** @type {puppeteer.ElementHandle} */
  const saveToggle = await page.waitForXPath(saveXPath, { visible: true });
  const saveText = await page.evaluate(
    (element) => element.textContent,
    saveToggle,
  );

  if (saveText === 'Show Cloud Saves') {
    return saveToggle.click();
  }
}

/**
 *
 * @param {puppeteer.Page} page
 * @param {0|1|2} [character] - Which character to choose. Defaults to 0.
 */
async function chooseCharacter(page, character = 0) {
  await page.evaluate(async (saveIndex) => {
    selectCharacter(saveIndex);
  }, character);
  return confirmOverwrite(page);
}

/**
 *
 * @param {puppeteer.Page} page
 */
async function confirmOverwrite(page) {
  const confirmSelector =
    'body > div.swal2-container.swal2-center.swal-infront.swal2-backdrop-show > div > div.swal2-actions > button.swal2-confirm.swal2-styled';
  return navigate(page, confirmSelector, { waitUntil: 'networkidle2' });
}
