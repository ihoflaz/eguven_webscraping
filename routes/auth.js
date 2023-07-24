const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient, PrismaClientKnownRequestError } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);

    // Kullanıcı adı ve şifre kontrolü
    const user = await prisma.users.findFirst({
        where: {
            email: email,
        },
    });

    if (!user) {
        return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
        return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
    }

    // Check if user is active
    if (!user.active) {
        return res.status(401).json({ error: 'Bu hesap aktif değil' });
    }

    // JWT token oluşturma
    const expiresIn = '12h';
    const token = jwt.sign({ id: user.id }, 'SECRET_KEY', { expiresIn });

    res.json({ token, expiresIn });
});

router.post('/register', async (req, res) => {
    try {
        const {
            companyName,
            companyAddress,
            companyPhone,
            firstName,
            lastName,
            email,
            phone,
            password,
        } = req.body;

        // Şifreyi bcrypt ile hash'leme
        const hashedPassword = await bcrypt.hash(password, 10);

        // Şirketi veritabanına kaydetme
        const company = await prisma.company.create({
            data: {
                name: companyName,
                address: companyAddress,
                phone: companyPhone,
            },
        });

        // Default permissions
        const defaultPermissions = ['user:create', 'user:read', 'user:update'];

        // Get the permissions from the database
        const permissions = await prisma.permission.findMany({
            where: {
                name: {
                    in: defaultPermissions,
                },
            },
        });

        // Şirketin ilk yetkilisini veritabanına kaydetme
        const user = await prisma.users.create({
            data: {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                password: hashedPassword,
                companyId: company.id,
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

        res.json({success: true, message: 'Kayıt işlemi başarılı'});
    } catch (error) {
        if (error instanceof PrismaClientKnownRequestError) {
            if (error.code === 'P2002') {
                // P2002 is the error code for unique constraint violations
                const fieldName = error.meta.target[0]; // the field that caused the error
                const errorMessage = `${fieldName} is already in use. Please choose another one.`;
                return res.status(400).json({ error: errorMessage });
            }
        }
        // If it's not a unique constraint error, pass it to the next middleware
        res.status(500).json({error: error.message});
    }
});

module.exports = router;
