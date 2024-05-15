const chromium = require("@sparticuz/chromium-min");
const puppeteer = require('puppeteer-core');
const fs = require('fs');

exports.handler = async (event, context) => {

  var start = Date.now();

  var url = event.queryStringParameters["url"] || undefined;
  var isP = event.queryStringParameters["p"] !== undefined;

  const urlBase = isP ? "https://yesdownloader.com/" : "https://www.downloader.wiki/";

  console.log(fs.existsSync("/tmp/chromium"));
  fs.readdirSync(testFolder).forEach(file => {
    console.log(file);
  });

  const path = process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath("https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar");
  chromium.setGraphicsMode = false;
  //console.log(path);

  const browser = await puppeteer.launch({
    executablePath: path,
    headless: chromium.headless,
    args: [...chromium.args, '--no-sandbox'],
  });
  console.log("get new page");
  var page = await browser.newPage();

  console.log("got to page");
  await page.goto(`${urlBase}`);

  console.log("type url");
  await page.focus("#ytUrl");
  await page.keyboard.type(url);

  console.log("wait for idle");
  await page.waitForSelector("#convertForm > button");
  await page.click("#convertForm > button");

  try {
    console.log("wait for selector");
    await page.waitForSelector("#dtable tbody tr td a[href*=\"sdownload\"]");
  } catch (error) {
    browser.close();
    return {
      statusCode: 200,
      body: JSON.stringify({ error: "ERROR - Page not loaded correctly!", time: (Date.now() - start) / 1000 })
    }
  }

  console.log("eval code to get hrefs");
  let list = await page.evaluate((sel) => {
    let elements = Array.from(document.querySelectorAll(sel));
    let links = elements.map(element => {
      return element.href
    })
    return links;
  }, '#dtable tbody tr td a[href*=\"sdownload\"]');

  console.log("check list length");
  if (list.length > 0) {
    console.log("go to last page");
    console.log(list[list.length - 1]);
    var content = await page.goto(list[list.length - 1]);
    console.log("get page text");
    var text = await content.text();
    console.log("check regex");
    const regS = [...text.match(new RegExp(/<script>[\n](.+)<\/script>/, "g"))];
    console.log(regS);
    var script = regS[0][1];

    var indexofEnd = script.indexOf("function mJHlA()");
    var rest = script.substring(0, indexofEnd);

    console.log("eval code rest");
    var dlUrl = eval(rest);
    browser.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ url: dlUrl, time: (Date.now() - start) / 1000 })
    }
  }
  browser.close();

  return {
    statusCode: 200,
    body: JSON.stringify({ error: "FAILED", time: (Date.now() - start) / 1000 })
  }
}