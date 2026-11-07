const { User } = require('../models');
const bcrypt = require('bcrypt');
const logger = require('../config/logger');
const passport = require('passport');

exports.register = async (req, res) => {
    const { email, password } = req.body;

    logger.info({ email }, 'Registration required for new user');

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        logger.debug('Password hashed successfully');

        const utente = await User.create({ email, password: hashedPassword });
        logger.info({ email, id: utente.id }, 'User succesfully created');

        res.status(201).json({ message: 'User created successfully', id: utente.id });
    } catch (err) {
        logger.error({ email, error: err.message }, 'Error occurred while registering the user');
        if (err.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }
        return res.status(500).json({ error: 'Error occurred while registering the user' });
    }
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    passport.authenticate('local', (err, utente, info) => {
        if (err) {
            logger.error({ email, error: err.message }, 'Error occurred while logging in the user');
            return res.status(500).json({ error: 'Internal server error' });
        }

        if (!utente) {
            logger.warn({ email }, 'Login failed');
            return res.status(401).json({ error: info?.message || 'Invalid credentials' });
        }

        req.logIn(utente, (err) => {
            if (err) {
                logger.error(
                    { email, error: err.message },
                    'Error occurred while logging in the user',
                );
                return res.status(500).json({ error: 'Error occurred while logging in the user' });
            }
            logger.info(
                { id: utente.id, email: utente.email, type: utente.type },
                'Login succeeded',
            );
            return res.status(200).json({
                message: 'Login succeeded',
                id: utente.id,
                email: utente.email,
                type: utente.type,
            });
        });
    })(req, res, next);
};

exports.logout = async (req, res, next) => {
    const utente = req.user;
    req.logout((err) => {
        if (err) return next(err);
        logger.info({ id: utente?.id, email: utente?.email }, 'Logout succeeded');
        req.session.destroy();
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
};
