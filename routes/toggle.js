const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.put('/:type/:id/:value', async (req, res) => {
    try {
        const type = req.params.type;
        const id = parseInt(req.params.id);
        const value = req.params.value === 'true';
        const data = { active: value };
        if (type === 'company') {
            await prisma.company.update({
                where: { id },
                data,
            });
        } else if (type === 'user') {
            await prisma.users.update({
                where: { id },
                data,
            });
        } else {
            throw new Error('Invalid type');
        }
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.status(500).send('An error occurred while updating the data');
    }
});

module.exports = router;
