const express = require('express');
const router = express.Router();
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
    try {
        // Şirketin id'si
        const companyId = req.user.companyId;

        // Şirkete ait tüm esign'ları getir
        const esigns = await prisma.esign.findMany({
            where: {
                user: {
                    companyId: companyId,
                },
            },
        });
        console.log("Esigns: ", esigns);

        res.json({esigns});
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching the data');
    }
});

module.exports = router;