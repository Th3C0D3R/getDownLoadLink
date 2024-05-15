const chromium = require("@sparticuz/chromium-min");

chromium.executablePath("https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar").then(path => {
    console.log(path);
    process.env['CHROME_PATH'] = path;
});