const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Load the local cv.html file
        const cvPath = path.join(__dirname, 'cv.html');
        await page.goto('file:///' + cvPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });

        // Wait for fonts to load
        await new Promise(r => setTimeout(r, 2000));

        // Generate PDF
        await page.pdf({
            path: path.join(__dirname, 'Nandan_Sharma_Resume.pdf'),
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '15mm',
                right: '15mm'
            }
        });

        console.log('PDF generated successfully: Nandan_Sharma_Resume.pdf');
    } catch (err) {
        console.error('Error generating PDF:', err.message);
        process.exit(1);
    } finally {
        if (browser) await browser.close();
    }
})();
