const express = require('express');
const router = express.Router();
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/:id', async (req, res) => {
    try {
        // Kullanıcının id'si
        const id = parseInt(req.params.id);

        // User ve Company verilerini çek
        const user = await prisma.users.findUnique({
            where: {id},
            include: {
                company: true
            }
        });

        // Kullanıcıyı ve şirketi kontrol et
        if (!user || !user.company) {
            res.status(404).send('User or company not found');
            return;
        }

        // UserRefId'yi çek
        const userRefIdArray = await prisma.userRefId.findMany({
            where: {userId: id, active: true},
        });

        // UserRefId'yi kontrol et
        if (!userRefIdArray || userRefIdArray.length === 0) {
            res.status(404).send('Active UserRefId not found');
            return;
        }

        const userRefId = userRefIdArray[0];

        console.log("userRefId", userRefId);

        // UserRefId'yi kontrol et
        if (!userRefId) {
            res.status(404).send('UserRefId not found');
            return;
        }

        // URL'i oluştur
        const url = `${user.company.formUrl}?ref=${userRefId.refId}`;

        res.json({url});
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching the data');
    }
});

module.exports = router;
