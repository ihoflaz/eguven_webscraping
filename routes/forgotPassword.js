const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

router.post('/', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await prisma.users.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ error: 'No user found with this email.' });
        }

        const token = crypto.randomBytes(32).toString('hex');

        // check if a reset token already exists for the user
        let resetRecord = await prisma.passwordReset.findUnique({ where: { userId: user.id } });

        if (resetRecord) {
            // if it exists, update the record
            await prisma.passwordReset.update({
                where: { userId: user.id },
                data: { token, expiryDate: new Date(Date.now() + 60 * 60 * 1000) }
            });
        } else {
            // if not, create a new record
            await prisma.passwordReset.create({
                data: {
                    token,
                    expiryDate: new Date(Date.now() + 60 * 60 * 1000),
                    userId: user.id
                },
            });
        }

        const oauth2Client = new google.auth.OAuth2(
            "200144877481-5fa7bi6s4sjmhb8cvmt66s1n9dljbujf.apps.googleusercontent.com",
            "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",
            "https://developers.google.com/oauthplayground"
        );

        oauth2Client.setCredentials({
            refresh_token: '1//04NBZqRY19XWlCgYIARAAGAQSNwF-L9IrPjSybOyWRDWZCtspF_Kc2VREtLpUehsWOaVpI1IkqsOZ-88UCExJABpNbhXA7IzxBzA'
        });

        const accessToken = await oauth2Client.getAccessToken();

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'eimzaeguven@gmail.com',
                clientId: "200144877481-5fa7bi6s4sjmhb8cvmt66s1n9dljbujf.apps.googleusercontent.com",
                clientSecret: "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",
                refreshToken: 'REFRESH_TOKEN',
                accessToken: accessToken.token
            },
        });

        const mailOptions = {
            from: 'eimzaeguven@gmail.com',
            to: user.email,
            subject: 'Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.
              Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it: 
              http://localhost:4000/auth/reset-password?token=${token}`,
        };

        transporter.sendMail(mailOptions, (err) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'An error occurred while sending email.' });
            } else {
                return res.status(200).json({ message: 'Password reset link sent.' });
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

module.exports = router;
