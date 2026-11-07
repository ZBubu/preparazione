// middlewares/auth.middleware.js

// Verifica che l'utente sia autenticato (qualsiasi tipo)
exports.isAuthenticated = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return res.status(401).json({ error: 'Devi effettuare il login' });
    }
    next();
};

// Middleware generico e riusabile: accetta uno o più tipi ammessi
exports.hasRole = (...tipiAmmessi) => {
    return (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.status(401).json({ error: 'Devi effettuare il login' });
        }

        if (!tipiAmmessi.includes(req.user.type)) {
            return res.status(403).json({ error: 'Accesso negato: permessi insufficienti' });
        }

        next();
    };
};

// Scorciatoie comode per i ruoli più usati
exports.isAdmin = exports.hasRole('admin');
exports.isDocente = exports.hasRole('admin', 'docente');
exports.isStudente = exports.hasRole('admin', 'docente', 'studente');
