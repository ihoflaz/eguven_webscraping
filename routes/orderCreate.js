const express = require('express');
const router = express.Router();
const {PrismaClient, PrismaClientKnownRequestError} = require('@prisma/client');
const prisma = new PrismaClient();
const Queue = require('bull');

const orderQueue = new Queue('orderQueue');

orderQueue.process(async (job) => {
    const {data, user} = job.data;
    try {
        return await prisma.esign.create({
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
                status: 'Yeni',
                statusDetails: 'Yeni Sipariş',
                userId: user.id,
            },
        });
    } catch (error) {
        console.error('Error:', error);
        if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
            const fieldName = error.meta.target[0];
            const errorMessage = `${fieldName} is already in use. Please choose another one.`;
            throw new Error(errorMessage);
        } else {
            throw error;
        }
    }
});

router.post('/', async (req, res) => {
    const data = req.body;
    const user = req.user;
    try {
        const job = await orderQueue.add({ data, user });
        await job.finished();
        res.json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;