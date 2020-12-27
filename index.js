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

  await browser.close();
})();
