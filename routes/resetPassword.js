const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
router.post('/', async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ error: 'Token and password are required.' });
    }

    try {
        // Find the password reset record
        let resetRecord = await prisma.passwordReset.findUnique({
            where: { token }
        });

        if (!resetRecord) {
            return res.status(404).json({ error: 'Invalid or expired token.' });
        }

        // Check if the token has expired
        if (new Date() > resetRecord.expiryDate) {
            return res.status(400).json({ error: 'Token has expired.' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the user's password
        await prisma.users.update({
            where: { id: resetRecord.userId },
            data: { password: hashedPassword }
        });

        // Delete the password reset record
        await prisma.passwordReset.delete({ where: { token } });

        return res.status(200).json({ message: 'Password has been reset.' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

module.exports = router;
