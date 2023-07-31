const express = require('express');
const router = express.Router();
const {PrismaClient} = require('@prisma/client');
const bcrypt = require('bcrypt');
const {PrismaClientKnownRequestError} = require("@prisma/client");

const prisma = new PrismaClient();


router.post('/', async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            password,
        } = req.body;

        // Şifreyi bcrypt ile hash'leme
        const hashedPassword = await bcrypt.hash(password, 10);

        // Default permissions
        const defaultPermissions = ['order:read', 'order:create'];

        // Get the permissions from the database
        const permissions = await prisma.permission.findMany({
            where: {
                name: {
                    in: defaultPermissions,
                },
            },
        });

        // Yeni kullanıcıyı oluştur
        const user = await prisma.users.create({
            data: {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                password: hashedPassword,
                companyId: req.user.companyId,
            },
        });

        // Add the default permissions to the user
        for (const permission of permissions) {
            await prisma.userPermission.create({
                data: {
                    userId: user.id,
                    permissionId: permission.id,
                },
            });
        }

        // Hassas bilgileri çıkar
        const userSafe = {...user, password: undefined};

        // Yeni kullanıcıyı (hassas bilgileri çıkarılmış haliyle) döndür
        res.json(userSafe);
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                const fieldName = error.meta.target[0];
                const errorMessage = `${fieldName} is already in use. Please choose another one.`;
                res.status(400).json({ error: errorMessage });
            } else {
                res.status(500).json({ error: error.message });
            }
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

module.exports = router;
