var express = require('express');
var router = express.Router();
const {PrismaClient} = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();


/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});
router.post('/', async (req, res) => {
    const {
        companyId, // Add this
        firstName,
        lastName,
        email,
        phone,
        password,
    } = req.body;

    // Kullanıcı rol kontrolü
    if (req.user.role === 'admin' || (req.user.role === 'user' && req.user.companyId === companyId)) {
        // Şifreyi bcrypt ile hash'leme
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcıyı oluştur
        const user = await prisma.users.create({
            data: {
                firstName: firstName,
                lastName: lastName,
                email: email,
                phone: phone,
                password: hashedPassword,
                companyId: req.user.role === 'admin' ? companyId : req.user.companyId, // Update this
                role: 'user',
            },
        });

        // Hassas bilgileri çıkar
        const userSafe = {...user, password: undefined};

        // Yeni kullanıcıyı (hassas bilgileri çıkarılmış haliyle) döndür
        res.json(userSafe);
    } else {
        // Yetkisiz istek
        res.status(401).json({error: 'Yetkisiz istek'});
    }
});

module.exports = router;
