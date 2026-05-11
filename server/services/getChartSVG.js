module.paths.push(process.argv[4]);
const { time } = require('console');
const puppeteer = require('puppeteer');

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
};

(async() => {
    let browser;
    const watchdog = setTimeout(() => {
        console.error('getChartSVG watchdog fired, exiting');
        process.exit(1);
    }, 60000); // 60 seconds
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            executablePath: process.argv[5]
        });
        await timeout(1000)
        const page = await browser.newPage();
        await timeout(1000)
        await page.setViewport({width: 1920, height: 1080})
        await page.goto(process.argv[2], {waitUntil: 'networkidle2', timeout: 60000});
        await timeout(1000)
        await page.screenshot({path: process.argv[3], clip: { x: 0, y: 0, width: 1150, height: 1080 }});
    } catch (error) {
        console.error('Error occurred while generating chart SVG:', error);
        process.exitCode = 1;
    } finally {
        if (browser) {
            try { await browser.close(); } catch (_) {}
        }
        clearTimeout(watchdog);
    }

})();
