const jwt = require('jsonwebtoken');
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async function authUser(req, res, next) {
    try {
        // JWT token'ı doğrula
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "Yetkilendirme başlığı bulunamadı" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "JWT token bulunamadı" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, "SECRET_KEY");
        } catch (error) {
            return res.status(401).json({ error: "Geçersiz JWT token" });
        }

        // Kullanıcıyı request nesnesine ekle
        const user = await prisma.users.findUnique({
            where: {
                id: decoded.id,
            },
            include: {
                UserPermission: {
                    include: {
                        permission: true
                    }
                }
            }
        });
        // Check if user is active
        if (!user.active) {
            return res.status(401).json({ error: 'Bu hesap aktif değil' });
        }

        if (!user) {
            return res.status(404).json({ error: "Kullanıcı bulunamadı" });
        }

        if (user.UserPermission) {
            user.permissions = user.UserPermission.map(userPermission => userPermission.permission.name);
        } else {
            user.permissions = [];
        }

        // Sonraki middleware'e geç
        req.user = user;
        next();
    } catch (error) {
        console.log("500 Hatası");
        res.status(500).json({error: error.message});
    }
};
