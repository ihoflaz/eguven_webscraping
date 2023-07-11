const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();
const Queue = require('bull');

const myQueue = new Queue('myQueue');

const proxy = '192.168.127.25';
const username = 'mimsoft1';
const password = 'EgfiM2023*';

router.get('/', (req, res) => {
    res.send('eguven')
})

myQueue.process(async (job) => {
    const {data, user} = job.data;
    try {
        const createdEsign = await prisma.esign.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                tcno: data.tcno,
                email: data.email,
                telefon: data.telefon,
                serino: data.serino,
                startdate: data.startdate,
                enddate: data.enddate,
                birth: data.birth,
                uyruk: data.uyruk,
                birthloc: data.birthloc,
                secword: data.secword,
                pazarlamaizni: data.pazarlamaizni,
                telefonizni: data.telefonizni,
                epostaizni: data.epostaizni,
                smsizni: data.smsizni,
                teslimatadres: data.teslimatadres,
                teslimatil: data.teslimatil,
                teslimatilce: data.teslimatilce,
                userId: user.id,
            },
        });

        console.log(data);
        console.log('Created Esign:', createdEsign);
        const originalUrl = `http://${proxy}`;
        const newProxyUrl = await proxyChain.anonymizeProxy(originalUrl);
        const browser = await puppeteer.launch({
            headless: false,
            args: ['--start-maximized', `${newProxyUrl}`],
        });
        const page = await browser.newPage();
        await page.setViewport({
            width: 1920, // tarayıcının max width değeri alınmalı
            height: 1080, // tarayıcının max height değeri alınmalı
            deviceScaleFactor: 1,
        });
        await page.authenticate({username, password});
        await page.goto('http://192.168.127.25', {waitUntil: 'networkidle0'});

        async function getFrame(page, frameName) {
            const frames = await page.frames();
            return frames.find(f => f.name() === frameName);
        }

        let frame = await getFrame(page, 'AppLandingPage');
        let elementHandle = await frame.$('#AppModuleTileSec_1_Item_1');
        await elementHandle.click();
        await page.waitForNavigation({waitUntil: 'networkidle0'});
        await page.click('#sitemap-entity-nav_conts');
        await page.waitForNavigation({waitUntil: 'networkidle0'});
        await page.waitForSelector('[aria-label="Yeni"]');
        await page.click('[aria-label="Yeni"]');
        await page.waitForSelector('[aria-label="Ad"]');

        async function getInput(page, ariaLabel) {
            // Sayfadaki tüm input öğelerini alın
            const elements = await page.$$('input');

            // Doğru input öğesini bulun
            let element;
            for (const e of elements) {
                const ariaLabelValue = await e.evaluate(el => el.getAttribute('aria-label'));
                if (ariaLabelValue === ariaLabel) {
                    await page.waitForSelector(`[aria-label="${ariaLabel}"]`);
                    element = e;
                    break;
                }
            }

            return element;
        }

        let input = await getInput(page, 'Ad');
        await input.click({clickCount: 3});
        await page.keyboard.press('Backspace');
        await input.type(data.firstName);
        input = await getInput(page, 'Soyadı');
        await input.click({clickCount: 3});
        await page.keyboard.press('Backspace');
        await input.type(data.lastName);
        input = await getInput(page, 'TC No');
        await input.click({clickCount: 3});
        await page.keyboard.press('Backspace');
        await input.type(data.tcno);
        input = await getInput(page, 'E-posta');
        await input.click({clickCount: 3});
        await page.keyboard.press('Backspace');
        await input.type(data.email);
        input = await getInput(page, 'Cep Telefonu');
        await input.click({clickCount: 3});
        await page.keyboard.press('Backspace');
        await input.type(data.telefon);
        input = await getInput(page, 'TC Seri No');
        await input.click({clickCount: 3});
        await page.keyboard.press('Backspace');
        await input.type(data.serino);
        input = await getInput(page, 'Sertifika Başlangıç Tarihi');
        await input.click({clickCount: 1});
        await input.click({clickCount: 1});
        await input.type(data.startdate);
        input = await getInput(page, 'Sertifika Bitiş Tarihi'); //sertifika başlangıç tarihinden 3 yıl fazla olacak
        await input.click({clickCount: 1});
        await input.click({clickCount: 1});
        await input.type(data.enddate);
        input = await getInput(page, 'Doğum Günü');
        await input.click({clickCount: 1});
        await input.click({clickCount: 1});
        await input.type(data.birth);
        await page.keyboard.press('PageDown');
        await page.keyboard.press('PageDown');
        await page.keyboard.press('PageDown');
        await page.keyboard.press('PageDown');
        await page.keyboard.press('PageUp');
        await page.waitForSelector('select[data-id="new_uyruk\.fieldControl-option-set-select"]');
        await page.select('select[data-id="new_uyruk\.fieldControl-option-set-select"]', '100000000');
        await page.keyboard.press('PageDown');
        await page.keyboard.press('PageUp');
        await page.waitForSelector('input[aria-label="Doğum Yeri"]');
        input = await getInput(page, 'Doğum Yeri');
        await input.click({clickCount: 3});
        await page.keyboard.press('Backspace');
        await input.type(data.birthloc);
        await page.keyboard.press('PageDown');
        await page.waitForSelector('input[aria-label="Güvenlik Sözcüğü"]');
        input = await getInput(page, 'Güvenlik Sözcüğü');
        await input.click({clickCount: 3});
        await page.keyboard.press('Backspace');
        await input.type(data.lastName); // güvenlik sözcüğü yerine soy ad değeri gönderilecek
        await page.keyboard.press('PageDown');
        await page.keyboard.press('PageDown');
        await page.keyboard.press('PageUp');
        await page.waitForSelector('select[aria-label="Pazarlama İzni"]');
        await page.select(`select[aria-label="Pazarlama İzni"]`, "1");
        await page.waitForSelector('select[aria-label="Telefon İzin"]');
        await page.select(`select[aria-label="Telefon İzin"]`, "1");
        await page.waitForSelector('select[aria-label="Eposta İzin"]');
        await page.select(`select[aria-label="Eposta İzin"]`, "1");
        await page.waitForSelector('select[aria-label="SMS İzin"]');
        await page.select(`select[aria-label="SMS İzin"]`, "1");
        await page.keyboard.press('PageDown');
        await page.keyboard.press('PageDown');
        await page.waitForSelector('textarea[aria-label="Teslimat Adresi"]');
        await page.click('textarea[aria-label="Teslimat Adresi"]', {clickCount: 3});
        await page.keyboard.press('Backspace');
        await page.type('textarea[aria-label="Teslimat Adresi"]', data.teslimatadres);
        await page.waitForSelector('input[aria-label="Teslimat İli"]');
        input = await getInput(page, 'Teslimat İli');
        await input.click({clickCount: 3});
        await page.keyboard.press('Backspace');
        await input.type(data.teslimatil);
        await page.waitForSelector('input[aria-label="Teslimat İlçesi"]');
        input = await getInput(page, 'Teslimat İlçesi');
        await input.click({clickCount: 3});
        await page.keyboard.press('Backspace');
        await input.type(data.teslimatilce);

        // Click on the link that opens the new tab
        await page.waitForSelector('[aria-label="Kaydet"]');
        await page.click('[aria-label="Kaydet"]');
        await new Promise(r => setTimeout(r, 3000));
        await page.waitForSelector('[aria-label="İşlemler"]');
        await page.click('[aria-label="İşlemler"]');

        await page.screenshot({path: 'screenshot1.png'});

        // Wait for the new tab to open
        await new Promise(r => setTimeout(r, 3000));

        // Get all open pages
        const pages = await browser.pages();

        // Switch to the new tab
        const newPage = pages[pages.length - 1];


        // Select an option from the select menu
        await newPage.waitForSelector('#ddl');
        await newPage.select('#ddl', '7');
        await newPage.screenshot({path: 'screenshot2.png'});

        // // Click on the submit button
        await newPage.click('#btn');

        await newPage.waitForSelector('#txtyil');


        await newPage.type('#txtyil', "3");
        // await newPage.click('#btn');
        await newPage.screenshot({path: 'screenshot3.png'});
        await new Promise(r => setTimeout(r, 3000));
        await newPage.waitForNavigation({waitUntil: 'networkidle0'});


        /* await browser.close(); */

        await proxyChain.closeAnonymizedProxy(newProxyUrl, true);
    } catch (error) {
        console.error('Error:', error);
    }
});

router.post('/', async (req, res) => {
    const data = req.body;
    const user = req.user;

    // Burada kuyruğa yeni bir iş ekleyebilirsiniz
    await myQueue.add({data, user});
    res.send('Success');
});

router.get('/jobCounts', async (req, res) => {
    const jobCounts = await myQueue.getJobCounts();
    res.json(jobCounts);
});

module.exports = router;
