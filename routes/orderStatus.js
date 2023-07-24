const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const proxyChain = require('proxy-chain');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const Queue = require('bull');

const proxy = '192.168.127.25';
const username = 'mimsoft1';
const password = 'EgfiM2023*';

const statusCheckQueue = new Queue('statusCheckQueue');

statusCheckQueue.process(async (job) => {
    // Buraya webscraping işleminin kodunu ekleyin
    // İşlem tamamlandığında sipariş durumunu güncelleyin
    // ...
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

    await statusCheckQueue.add({data: order, user});

    const updatedOrder = await prisma.esign.findUnique({
        where: {
            id: id,
        },
    });

    res.json(updatedOrder);
});

module.exports = router;
