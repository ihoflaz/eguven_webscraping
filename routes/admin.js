const express = require('express');
const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient();
const router = express.Router();

// Hassas bilgileri çıkaran yardımcı fonksiyon
function sanitizeUser(user) {
    const { password, createdAt, updatedAt, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
}

function sanitizeCompany(company) {
    const { createdAt, updatedAt, ...companyWithoutSensitiveData } = company;
    return companyWithoutSensitiveData;
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
            // Şirketlerin ve kullanıcılarının hassas bilgilerini çıkar
            const sanitizedCompanies = companies.map(company => ({
                ...sanitizeCompany(company),
                users: company.users.map(sanitizeUser),
            }));

            res.json({ companies: sanitizedCompanies });
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
            // Şirketin ve kullanıcılarının hassas bilgilerini çıkar
            const sanitizedCompany = {
                ...sanitizeCompany(company),
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
