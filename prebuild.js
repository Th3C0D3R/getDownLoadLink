const chromium = require("@sparticuz/chromium-min");

var path = await chromium.executablePath("https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar");

console.log(path);
process.env['CHROME_PATH'] = path;