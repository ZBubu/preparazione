const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const { User } = require('../models');

module.exports = (passport) => {
    passport.use(
        new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
            try {
                const user = await User.findOne({ where: { email } });
                if (!user || !(await bcrypt.compare(password, user.password))) {
                    return done(null, false, { message: 'credenziali non valide' });
                }
                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }),
    );

    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            done(null, await User.findByPk(id));
        } catch (error) {
            done(error);
        }
    });
};
