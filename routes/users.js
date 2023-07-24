const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function sanitizeUser(user) {
    const { password, createdAt, updatedAt, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
}
router.post('/', async (req, res) => {
    try {
        const companyId = req.user.companyId;  // Kullanıcının şirketinin ID'sini al
        const users = await prisma.users.findMany({
            where: { companyId },  // Bu şirkete ait tüm kullanıcıları sorgula
            include: {
                UserPermission: {
                    include: {
                        permission: true
                    }
                }
            } // Kullanıcının yetkilerini dahil et
        });
        const sanitizedUsers = users.map(sanitizeUser); // Her kullanıcı için hassas bilgileri çıkar
        res.json({users: sanitizedUsers});
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while fetching the data');
    }
});

module.exports = router;