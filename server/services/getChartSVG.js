module.paths.push(process.argv[4]);
const puppeteer = require('puppeteer');

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

(async() => {
    try {
        const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        await timeout(1000)
        const page = await browser.newPage();
        await timeout(1000)
        await page.setViewport({width: 1920, height: 1080})
        await page.goto(process.argv[2], {waitUntil: 'networkidle2'});
        await timeout(1000)
        await page.screenshot({path: process.argv[3], clip: { x: 0, y: 0, width: 1150, height: 1080 }});
        browser.close();
    } catch (error) {
        console.error('Error occurred while generating chart SVG:', error);
    }

})();
