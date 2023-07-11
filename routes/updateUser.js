const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.put('/:id', async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const data = req.body;
        const updatedUser = await prisma.users.update({
            where: { id },
            data,
        });
        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while updating the company');
    }
});

module.exports = router;