const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
    try {
        res.json({ permissions: req.user.permissions });
    } catch (error) {
        res.status(500).json({ error: 'Yetkileri alırken bir hata oluştu.' });
    }
});

module.exports = router;