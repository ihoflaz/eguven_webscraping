const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function sanitizeUser(user) {
    const { password, createdAt, updatedAt, ...userWithoutSensitiveData } = user;
    return userWithoutSensitiveData;
}
router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        const updatedUser = await prisma.users.update({
            where: { id },
            data,
        });
        const sanitizedUser = sanitizeUser(updatedUser);
        res.json(sanitizedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while updating the company');
    }
});

module.exports = router;