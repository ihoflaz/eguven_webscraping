const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = function(permission) {
    return async function(req, res, next) {
        try {
            // Fetch the permission from the database
            const permissionInDb = await prisma.permission.findUnique({
                where: { name: permission },
            });

            // If the permission does not exist, reject the request
            if (!permissionInDb) {
                return res.status(403).json({ error: 'Yetkisiz istek' });
            }

            // Check if user has the required permission
            if (!req.user.permissions.includes(permission)) {
                return res.status(403).json({ error: 'Yetkisiz istek' });
            }
            next();
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: error.message });
        }
    }
}