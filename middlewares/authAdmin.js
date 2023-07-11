const jwt = require('jsonwebtoken');
const {PrismaClient} = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async function authUser(req, res, next) {
    try {
        // JWT token'ı doğrula
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, 'SECRET_KEY');

        // Kullanıcıyı request nesnesine ekle
        req.user = await prisma.users.findUnique({
            where: {
                id: decoded.id,
            },
        });

        // Sonraki middleware'e geç
        next();
    } catch (error) {
        console.log("500 Hatası");
        res.status(500).json({error: error.message});
    }
};
