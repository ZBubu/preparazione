//app.js
const express = require('express');
const logger = require('./config/logger');
const session = require('express-session');
const path = require('path');
const passport = require('passport');
require('dotenv').config();
const app = express();

const sessionSecret = process.env.SESSION_SECRET;

app.set('query parser', 'extended');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
    session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24,
        }, // 1 giorno
    }),
);
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);
app.use((req, res, next) => {
    res.locals.utente = req.user || null;
    res.locals.currentPath = req.path;
    next();
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views')); // cartella con i template

app.use('', require('./routes/auth.routes'));
app.use('/admin', require('./routes/admin.routes'));
app.use('', require('./routes/map.routes'));

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
    });
});

// Error handler
app.use((err, req, res, _next) => {
    logger.error(
        {
            err,
        },
        'Unhandled application error',
    );

    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});

module.exports = app;
