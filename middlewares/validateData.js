const validate = require("./validate");
module.exports = function validateData(req, res, next) {
    const data = req.body;
    const errors = validate(data);
    if (errors.length === 0) {
        next();
    } else {
        res.status(400).json({errors});
    }
};