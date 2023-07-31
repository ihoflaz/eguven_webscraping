const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Queue = require('bull');

const proxy = '192.168.127.25';
const username = 'mimsoft1';
const password = 'MytP2023**';

const statusCheckQueue = new Queue('statusCheckQueue');

statusCheckQueue.process(async (job) => {
    const { data, user } = job.data;
    try {
        const originalUrl = `http://${proxy}`;
        const newProxyUrl = await proxyChain.anonymizeProxy(originalUrl);
        const browser = await puppeteer.launch({
            defaultViewport: null,
            headless: false,
            args: ['--start-maximized', `${newProxyUrl}`],
        });
        const page = await browser.newPage();
        await page.authenticate({ username, password });
        await page.goto('http://192.168.127.25', { waitUntil: 'networkidle0' });

        async function getFrame(page, frameName) {
            const frames = await page.frames();
            return frames.find(f => f.name() === frameName);
        }

        let frame = await getFrame(page, 'AppLandingPage');
        let elementHandle = await frame.$('#AppModuleTileSec_1_Item_1');
        await elementHandle.click();
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await page.click('#sitemap-entity-siparis');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 500));
        await page.waitForSelector('[aria-label="Etkin Satış Siparişleri"]');
        await new Promise(r => setTimeout(r, 500));
        await page.click('[aria-label="Etkin Satış Siparişleri"]');
        await new Promise(r => setTimeout(r, 500));
        await page.waitForSelector('[aria-label="Açık EDevlet Siparişleri - İş Ortakları"]');

        await page.click('[aria-label="Açık EDevlet Siparişleri - İş Ortakları"]');

        const tcno = '\"' + data.tcno + '\"';


        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        await new Promise(r => setTimeout(r, 500));
        try {
            await page.waitForSelector(`[title=${tcno}]`, { timeout: 3000 }); // 3 saniye bekle
            await page.click(`[title=${tcno}]`);
            // TCNO bulundu, web scraping'e devam edin...
        } catch (error) {
            // TCNO bulunamadı, sipariş durumunu güncelleyin...
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'Aktif Sipariş Yok',
                    statusDetails: 'Aktif Sipariş Sayfasinda Kullaniciya Ait Siparis Yoktur'
                },
            });

            await browser.close();
        }

        await page.waitForSelector('[aria-label="Düzenle"]');
        await page.click('[aria-label="Düzenle"]');

        await new Promise(r => setTimeout(r, 500));
        await page.waitForSelector('select[aria-label="BTK Doğrulama"]');

        const status = await page.evaluate(() => {
            const select = document.querySelector('select[aria-label="BTK Doğrulama"]');
            const selectedOption = select.querySelector('option[data-selected="true"]');
            return selectedOption ? selectedOption.innerText : null;
        });

        console.log(status);

        await browser.close();

        await proxyChain.closeAnonymizedProxy(newProxyUrl, true);

        // Eğer sipariş durumu 'Doğrulama Bekleniyor' ise veritabanını 'Müşteri Doğrulaması Bekleniyor' olarak güncelle
        if (status === 'Doğrulama Bekleniyor') {
            await prisma.esign.update({
                where: {
                    id: data.id,
                },
                data: {
                    status: 'Müşteri Onayı Bekleniyor',
                    statusDetails: 'Müşteri Onayı Bekleniyor',
                },
            });
        }
        // Eğer sipariş durumu 'Doğrulandı' ise veritabanını 'Müşteri Doğruladı' olarak güncelle
        else if (status === 'Doğrulandı') {
            await prisma.esign.update({
                where: {
                    id: data.id,
                },
                data: {
                    status: 'Müşteri Doğruladı',
                    statusDetails: 'Müşteri Siparisi Doğruladı',
                },
            });
        }

        return true;
    } catch (error) {
        console.error('Error:', error);
        // If an error occurs, update the order status to 'Error' and add the error message
        await prisma.esign.update({
            where: {
                id: data.id,
            },
            data: {
                status: 'Kontrol Edilirken Bir Hata Oluştu',
                statusDetails: error.message, // Add the error message
            },
        });
        return false;
    }
});

router.post('/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const user = req.user;

    const order = await prisma.esign.findUnique({
        where: {
            id: id,
        },
    });

    if (!order) {
        res.status(404).json({ error: 'Order not found' });
        return;
    }

    await prisma.esign.update({
        where: {
            id: id,
        },
        data: {
            status: 'Kontrol Ediliyor',
            statusDetails: "Siparis kontrol ediliyor",
        },
    });

    await statusCheckQueue.add({ data: order, user });

    const updatedOrder = await prisma.esign.findUnique({
        where: {
            id: id,
        },
    });

    res.json(updatedOrder);
});

module.exports = router;
