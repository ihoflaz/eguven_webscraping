const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const bodyParser = require("body-parser");
const validateData = require('./middlewares/validateData');
const authenticate = require('./middlewares/authenticate');
const authAdmin = require('./middlewares/authAdmin');

const indexRouter = require('./routes/index');
const addUsersRouter = require('./routes/add_users');
const eguvenRouter = require('./routes/eguven');
const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const updateCompanyRouter = require('./routes/updateCompany');
const updateUserRouter = require('./routes/updateUser');
const toggleRouter = require('./routes/toggle');
const esignRouter = require('./routes/esign');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/auth', authRouter);

app.use(bodyParser.json());
app.use('/eguven', authenticate, validateData, eguvenRouter);

app.use('/admin', authAdmin, adminRouter);

app.use('/', indexRouter);
app.use('/add_users', authAdmin, addUsersRouter);
app.get('/eguven/jobCounts', eguvenRouter);
app.use('/company', authAdmin, updateCompanyRouter);
app.use('/user', authAdmin, updateUserRouter);
app.use('/toggle', authAdmin, toggleRouter);
app.use('/esign', authAdmin, esignRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
