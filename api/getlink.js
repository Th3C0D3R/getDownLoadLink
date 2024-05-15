const puppeteer = require("puppeteer");
const chromium = require("@sparticuz/chromium");

exports.handler = async (event, context) => {

  var start = Date.now();

  var url = event.queryStringParameters["url"] || undefined;
  var isP = event.queryStringParameters["p"] !== undefined;

  const urlBase = isP ? "https://yesdownloader.com/" : "https://www.downloader.wiki/";

  const browser = await puppeteer.launch({
    executablePath: await chromium.executablePath(),
    headless: 'shell',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  var page = await browser.newPage();

  console.log("got to page");
  await page.goto(`${urlBase}`);

  console.log("type url");
  await page.focus("#ytUrl");
  await page.keyboard.type(url);

  console.log("wait for idle");
  await page.waitForNetworkIdle();
  await page.click("#convertForm > button");

  try {
    console.log("wait for selector");
    await page.waitForSelector("#dtable tbody tr td a[href*=\"sdownload\"]");
  } catch (error) {
    browser.close();
    return {
      statusCode: 200,
      body: JSON.stringify({error:"ERROR - Page not loaded correctly!", time:(Date.now() - start)/1000})
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
    const regS = [...text.matchAll(new RegExp(/<script>[\n](.+)<\/script>/, "g"))];
    console.log(regS);
    var script = regS[0][1];

    var indexofEnd = script.indexOf("function mJHlA()");
    var rest = script.substring(0, indexofEnd);

    console.log("eval code rest");
    var dlUrl = eval(rest);
    browser.close();

    return {
      statusCode: 200,
      body: JSON.stringify({url:dlUrl, time:(Date.now() - start)/1000})
    }
  }
  browser.close();

  return {
    statusCode: 200,
    body: JSON.stringify({error:"FAILED", time:(Date.now() - start)/1000})
  }
}