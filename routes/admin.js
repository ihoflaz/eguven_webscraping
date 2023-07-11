const express = require('express');
const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Hassas bilgileri çıkaran yardımcı fonksiyon
function sanitizeUser(user) {
    const { password, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
}

router.post('/', async (req, res) => {
    try {
        // Kullanıcının rolünü kontrol et
        if (req.user.role === 'admin') {
            // Veritabanındaki bilgileri getir
            const companies = await prisma.company.findMany({
                include: {
                    users: true,
                },
            });
            // Şirketlerin kullanıcılarındaki hassas bilgileri çıkar
            const sanitizedCompanies = companies.map(company => ({
                ...company,
                users: company.users.map(sanitizeUser),
            }));

            const esigns = await prisma.esign.findMany();
            res.json({ companies: sanitizedCompanies, esigns });
        } else {
            // Sadece kullanıcıya ait verileri getir
            const company = await prisma.company.findUnique({
                where: {
                    id: req.user.companyId,
                },
                include: {
                    users: true,
                },
            });
            // Şirketin kullanıcılarındaki hassas bilgileri çıkar
            const sanitizedCompany = {
                ...company,
                users: company.users.map(sanitizeUser),
            };

            const esigns = await prisma.esign.findMany({
                where: {
                    userId: req.user.id,
                },
            });

            res.json({ companies: [sanitizedCompany], esigns });
        }
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

module.exports = router;
