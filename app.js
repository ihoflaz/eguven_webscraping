const createError = require('http-errors');
const express = require('express');
const path = require('path');
const winston = require('winston');
const uuid = require("uuid");
const cookieParser = require('cookie-parser');
const cors = require('cors');

const bodyParser = require("body-parser");
const validateData = require('./middlewares/validateData');
const authUser = require('./middlewares/authUser');
const tcKimlikCheck = require('./middlewares/tcKimlikCheck');
const RequirePermission = require('./middlewares/requirePermission');
const authRefId = require('./middlewares/authRefId');


const addUsersRouter = require('./routes/add_users');
const orderCreateRouter = require('./routes/orderCreate');
const orderConfirmRouter = require('./routes/orderConfirm');
const orderStatusRouter = require('./routes/orderStatus');
const orderDeleteRouter = require('./routes/orderDelete');
const authRouter = require('./routes/auth');
const forgotPasswordRouter = require('./routes/forgotPassword');
const resetPasswordRouter = require('./routes/resetPassword');
const adminRouter = require('./routes/admin');
const updateCompanyRouter = require('./routes/updateCompany');
const updateUserRouter = require('./routes/updateUser');
const toggleRouter = require('./routes/toggle');
const esignRouter = require('./routes/esign');
const esignsRouter = require('./routes/esigns');
const usersRouter = require('./routes/users');
const userUrlRouter = require('./routes/userUrl');
const permissionRouter = require('./routes/updatePermission');
const permissionsRouter = require('./routes/permissions');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

const logger = winston.createLogger({
    level: 'info',  // Loglama seviyesi belirle
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
    ),
    defaultMeta: {service: 'eguven'},  // Tüm loglara eklenen varsayılan meta bilgileri belirle
    transports: [
        new winston.transports.File({filename: 'error.log', level: 'error'}),
        new winston.transports.File({filename: 'combined.log'}),
        new winston.transports.Console()
    ],
});

app.use((req, res, next) => {
    // İstek bilgilerini logla
    const start = Date.now();

    // UUID oluştur
    req.id = uuid.v4();

    // Response'ın 'finish' eventi tetiklendiğinde bu fonksiyon çalışacak
    res.on('finish', () => {
        const duration = Date.now() - start;
        const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
        const meta = {
            requestId: req.id,
            userId: req.user ? req.user.id : null,  // Kullanıcı kimliğini ekle
            body: req.body,  // Body bilgisini ekle
            query: req.query,  // Query bilgisini ekle
        };

        // Durum koduna göre log seviyesi ayarlanıyor
        if (res.statusCode >= 500) {
            logger.error(message, meta);
        } else if (res.statusCode >= 400) {
            logger.warn(message, meta);
        } else {
            logger.info(message, meta);
        }
    });
    next();
});

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.options('*', cors())
app.use(cors());
app.use(bodyParser.json());

app.use('/add_users', authUser, RequirePermission('user:read'), RequirePermission('user:create'), addUsersRouter);// create user
app.use('/orderCreate', authRefId, validateData, tcKimlikCheck, orderCreateRouter);// refId kullanildigi icin authUser middleware'i ve RequirePermission middleware'i kullanilmadi
app.use('/orderConfirm', authUser, RequirePermission('order:read'), RequirePermission('order:update'), orderConfirmRouter);// read order, update order
app.use('/orderStatus', authUser, RequirePermission('order:read'), RequirePermission('order:update'), orderStatusRouter);// read order, update order
app.use('/orderDelete', authUser, RequirePermission('order:delete'), orderDeleteRouter);// delete order
app.use('/company', authUser, RequirePermission('company:update'), updateCompanyRouter);// update company
app.use('/user', authUser, RequirePermission('user:update'), updateUserRouter);// update user
app.use('/toggle', authUser, RequirePermission('user:update'), toggleRouter);// update user
app.use('/esign', authUser, RequirePermission('order:create'), esignRouter);// create order
app.use('/esigns', authUser, RequirePermission('order:read'), esignsRouter);// read orders
app.use('/auth',  authRouter);
app.use('/forgotPassword',  forgotPasswordRouter);
app.use('/resetPassword',  resetPasswordRouter);
app.use('/admin', authUser, RequirePermission('company:create'), adminRouter);// all
app.use('/users', authUser, RequirePermission('user:read'), usersRouter);// read user
app.use('/userUrl', authUser, RequirePermission('user:read'), userUrlRouter);// read user
app.use('/permission', authUser, RequirePermission('user:update'), permissionRouter);// update user
app.use('/permissions', authUser, RequirePermission('order:read'), permissionsRouter);// read user

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
