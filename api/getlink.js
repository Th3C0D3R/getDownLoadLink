const chromium = require("@sparticuz/chromium-min");
const puppeteer = require('puppeteer-core');

function log(s) {
  if (process.env["DO_LOG"] === "1") {
    console.log(s);
  }
}
function timeStart(s) {
  if (process.env["DO_LOG"] === "1") {
    console.time(s);
  }
}
function timeLog(s) {
  if (process.env["DO_LOG"] === "1") {
    console.timeLog(s);
  }
}
function timeEnd(s) {
  if (process.env["DO_LOG"] === "1") {
    console.timeEnd(s);
  }
}

exports.handler = async (event, context) => {

  var start = Date.now();

  var url = event.queryStringParameters["url"] || undefined;
  var isP = event.queryStringParameters["p"] !== undefined;

  if (url === undefined) {
    return {
      statusCode: 501,
      body: JSON.stringify({ error: "ERROR - No URL provided!", time: (Date.now() - start) / 1000 })
    }
  }

  const urlBase = isP ? "https://yesdownloader.com/" : "https://www.downloader.wiki/";

  timeStart("debug");

  const path = process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath("https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar");
  chromium.setGraphicsMode = false;

  timeLog("debug");

  const browser = await puppeteer.launch({
    executablePath: path,
    headless: chromium.headless,
    args: [...chromium.args, '--no-sandbox'],
  });

  timeLog("debug");

  log("get new page");
  var page = await browser.newPage();
  timeLog("debug");

  log("got to page");
  await page.goto(`${urlBase}`);
  timeLog("debug");

  log("type url");
  await page.focus("#ytUrl");
  await page.keyboard.type(url);
  timeLog("debug");

  log("wait for idle");
  await page.waitForSelector("#convertForm > button");
  await page.click("#convertForm > button");
  timeLog("debug");

  try {
    log("wait for selector");
    await page.waitForSelector("#dtable tbody tr td a[href*=\"sdownload\"]");
    timeLog("debug");
  } catch (error) {
    browser.close();
    return {
      statusCode: 501,
      body: JSON.stringify({ error: "ERROR - Page not loaded correctly!", time: (Date.now() - start) / 1000 })
    }
  }

  log("eval code to get hrefs");
  let list = await page.evaluate((sel) => {
    let elements = Array.from(document.querySelectorAll(sel));
    let links = elements.map(element => {
      return element.href
    })
    return links;
  }, '#dtable tbody tr td a[href*=\"sdownload\"]');
  timeLog("debug");

  log("check list length");
  if (list.length > 0) {
    log("go to last page");
    var content = await page.goto(list[list.length - 1]);
    timeLog("debug");

    log("get page text");
    var text = await content.text();
    timeLog("debug");

    log("check regex");
    const regS = [...text.matchAll(new RegExp(/<script>[\n](.+)<\/script>/, "g"))];
    var script = regS[0][1];
    var indexofEnd = script.indexOf("function mJHlA()");
    var rest = script.substring(0, indexofEnd);
    log(rest);
    timeLog("debug");

    log("eval code rest");
    var dlUrl = eval(rest);
    log(dlUrl);
    timeLog("debug");

    browser.close();
    timeEnd("debug");
    
    return {
      statusCode: 200,
      body: JSON.stringify({ link: dlUrl, time: (Date.now() - start) / 1000 })
    }
  }
  browser.close();

  return {
    statusCode: 501,
    body: JSON.stringify({ error: "FAILED", time: (Date.now() - start) / 1000 })
  }
}