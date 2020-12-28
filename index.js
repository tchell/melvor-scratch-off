require('dotenv').config();
const cliProgress = require('cli-progress');
const puppeteer = require('puppeteer');

/* TODO
 * CLI Args:
 *  - username
 *  - password
 *  - cloud/local
 *      - Character select
 *  - headless/headful
 *  - event name
 *  - set bank availability
 *  - check for bank not full
 *
 */

const username = process.env.USER_NAME;
const password = process.env.PASSWORD;
const eventString = 'Christmas Event 2020';

(async () => {
  const options = {
    headless: true,
    defaultViewport: {
      width: 2560 / 2,
      height: 1440,
    },
    //devtools: true,
  };
  const browser = await puppeteer.launch(options);
  const page = (await browser.pages())[0];

  await page.goto('https://melvoridle.com/cloud/login.php');
  await login(page);
  console.log(`Logged in as: ${username}.`);

  await acceptConditions(page);
  console.log('Accepted Beta Conditions.');

  await showCloudSaves(page);
  console.log('Picking a cloud save.');

  await chooseCharacter(page, 0);
  console.log(`Cloud save ${0 + 1} selected.`);

  await selectEventPage(page, eventString);
  console.log(`Opened ${eventString} event page.`);
  await page.waitForTimeout(5000);
  let progressBar;
  let presentCount, originalCount;
  const remaining = 340;
  do {
    await scratchPresent(page);
    await page.waitForTimeout(2000);
    presentCount = await getPresentCount(page);
    if (progressBar === undefined) {
      originalCount = presentCount;
      progressBar = new cliProgress.SingleBar(
        {},
        cliProgress.Presets.shades_classic,
      );
      progressBar.start(originalCount - remaining, 1);
    }
    progressBar.update(originalCount - presentCount);
  } while (presentCount > remaining);
  progressBar.stop();
  console.log(`${originalCount - remaining} present(s) opened. Exiting.`);

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

/**
 *
 * @param {puppeteer.Page} page
 * @param {string} eventString - The name of the event.
 */
async function selectEventPage(page, eventString) {
  const eventXPath = `//div/span[text()="${eventString}"]`;
  const eventLink = await page.waitForXPath(eventXPath, { visible: true });
  return eventLink.click();
}

/**
 *
 * @param {puppeteer.Page} page
 */
async function getPresentCount(page) {
  const presentCountXPath = '//*[@id="current-xmas-presents"]';
  const presentCountElement = (await page.$x(presentCountXPath))[0];
  const presentCount = await page.evaluate(
    (element) => element.textContent,
    presentCountElement,
  );
  return parseInt(presentCount);
}

/**
 *
 * @param {puppeteer.Page} page
 */
async function scratchPresent(page) {
  const presentXPath = '//*[@id="js--sc--container"]/canvas';
  const presentElement = (await page.$x(presentXPath))[0];
  const present = await presentElement.boundingBox();
  const mouse = page.mouse;

  const xStart = present.x + 10;
  const xEnd = present.x + present.width - 10;
  const rowSize = present.height / 10;
  let mod = 4;
  let yLoc = present.y + rowSize * mod;

  do {
    await mouse.move(xStart, yLoc);
    await mouse.down();
    await mouse.move(xEnd, yLoc, { steps: 50 });
    await mouse.up();
    mod += 2;
    yLoc = present.y + rowSize * mod;
  } while (mod < 8);
}
