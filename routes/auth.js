const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
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

    res.json({ token, expiresIn, role: user.role });
});

router.post('/register', async (req, res) => {
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
    console.log(req.body);

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

    // Şirketin ilk yetkilisini veritabanına kaydetme
    await prisma.users.create({
        data: {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            password: hashedPassword,
            companyId: company.id,
            role: 'user',
        },
    });

    res.json({ message: 'Kayıt işlemi başarılı' });
});

module.exports = router;
