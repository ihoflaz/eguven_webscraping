const express = require('express');
const router = express.Router();
const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

router.put('/:id', async (req, res) => {
    try {
        let {permissions} = req.body;
        console.log("permissions", permissions);
        const id = parseInt(req.params.id, 10);

        // Eğer 'order:create' yetkisi varsa, diğer tüm yetkileri çıkar
        if (permissions.includes('order:create')) {
            permissions = ['order:create'];
        }

        // Yeni yetkileri eklemek için tüm mevcut yetkileri çıkar
        await prisma.userPermission.deleteMany({
            where: {
                userId: id
            }
        });

        // Yeni yetkileri ekleyin
        for (const permissionName of permissions) {
            // Yetki adına göre yetkiyi bulun
            const permission = await prisma.permission.findUnique({
                where: {
                    name: permissionName
                }
            });

            // Yetki bulunamazsa hata döndür
            if (!permission) {
                return res.status(400).json({error: `Permission '${permissionName}' not found`});
            }

            // Kullanıcı yetkisini oluşturun
            await prisma.userPermission.create({
                data: {
                    userId: id,
                    permissionId: permission.id
                }
            });
        }

        // Güncellenmiş yetkileri al
        const updatedUser = await prisma.users.findUnique({
            where: {
                id: id
            },
            include: {
                UserPermission: {
                    include: {
                        permission: true
                    }
                }
            }
        });
        console.log("updatedUser", updatedUser.UserPermission);
        // Güncellenmiş yetkileri döndür
        res.json(updatedUser.UserPermission);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: error.message});
    }
});

module.exports = router;