const express = require('express');
const router = express.Router();
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const data = await prisma.esign.findMany({
            where: {userId}
        });
        res.json({data});
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching the data');
    }
});

module.exports = router;