const puppeteer = require("puppeteer");

exports.handler = async (event, context) => {

  var start = Date.now();

  var url = event.queryStringParameters["url"] || undefined;
  var isP = event.queryStringParameters["p"] !== undefined;

  const urlBase = isP ? "https://yesdownloader.com/" : "https://www.downloader.wiki/";

  const browser = await puppeteer.launch();
  var page = await browser.newPage();

  await page.goto(`${urlBase}`);

  await page.focus("#ytUrl");
  await page.keyboard.type(url);

  await page.waitForNetworkIdle();
  await page.click("#convertForm > button");

  try {
    await page.waitForSelector("#dtable tbody tr td a[href*=\"sdownload\"]");
  } catch (error) {
    browser.close();
    return {
      statusCode: 200,
      body: JSON.stringify({error:"ERROR - Page not loaded correctly!", time:(Date.now() - start)/1000})
    }
  }

  let list = await page.evaluate((sel) => {
    let elements = Array.from(document.querySelectorAll(sel));
    let links = elements.map(element => {
      return element.href
    })
    return links;
  }, '#dtable tbody tr td a[href*=\"sdownload\"]');

  if (list.length > 0) {
    var content = await page.goto(list[list.length - 1]);
    var text = await content.text();
    const regS = [...text.matchAll(new RegExp(/<script>[\n](.+)<\/script>/, "g"))];
    var script = regS[0][1];

    var indexofEnd = script.indexOf("function mJHlA()");
    var rest = script.substring(0, indexofEnd);

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