const express = require('express');
const router = express.Router();
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/:id', async (req, res) => {
    try {
        // Şirketin id'si
        const id = parseInt(req.params.id);
        const companyId = req.user.companyId;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Siparişi sil
        await prisma.esign.delete({
            where: { id },
        });

        // Rol kontrolü
        let esigns;
        if(userRole === "user") {
            // Eğer kullanıcı rolü "user" ise sadece kendi eSign'larını getir
            esigns = await prisma.esign.findMany({
                where: {
                    userId: userId,
                },
            });
        } else {
            // Eğer kullanıcı rolü "user" değilse şirketin tüm eSign'larını getir
            esigns = await prisma.esign.findMany({
                where: {
                    user: {
                        companyId: companyId,
                    },
                },
            });
        }

        res.json({esigns});
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching the data');
    }
});

module.exports = router;