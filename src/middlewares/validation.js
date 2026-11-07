const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Invalid input',
            details: errors.array({ onlyFirstError: true }),
        });
    }
    return next();
};

const emailValidation = body('email')
    .trim()
    .isEmail()
    .withMessage('A valid email address is required')
    .normalizeEmail();

const registerValidation = [
    emailValidation,
    body('password')
        .isString()
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must contain between 8 and 128 characters'),
    validate,
];

const loginValidation = [
    emailValidation,
    body('password')
        .isString()
        .notEmpty()
        .isLength({ max: 128 })
        .withMessage('Password is required and must not exceed 128 characters'),
    validate,
];

const userIdValidation = [
    param('id').isInt({ min: 1 }).withMessage('User id must be a positive integer').toInt(),
    validate,
];

const userBodyValidation = [
    emailValidation,
    body('type').isIn(['admin', 'viewer']).withMessage('User type must be admin or viewer'),
    body('password')
        .isString()
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must contain between 8 and 128 characters'),
    validate,
];

const updateUserValidation = [
    param('id').isInt({ min: 1 }).withMessage('User id must be a positive integer').toInt(),
    body('email').optional({ values: 'falsy' }).trim().isEmail().normalizeEmail(),
    body('type').optional({ values: 'falsy' }).isIn(['admin', 'viewer']),
    body('password')
        .optional({ values: 'falsy' })
        .isString()
        .isLength({ min: 8, max: 128 })
        .withMessage('Password must contain between 8 and 128 characters'),
    validate,
];

const datatableValidation = [
    query('draw').optional().isInt({ min: 0 }).toInt(),
    query('start').optional().isInt({ min: 0 }).toInt(),
    query('length').optional().isInt({ min: -1 }).toInt(),
    query('search[value]').optional({ values: 'falsy' }).trim().isLength({ max: 100 }),
    query('order[0][column]').optional().isInt({ min: 0, max: 2 }).toInt(),
    query('order[0][dir]').optional().isIn(['asc', 'desc']),
    validate,
];

module.exports = {
    datatableValidation,
    loginValidation,
    registerValidation,
    updateUserValidation,
    userBodyValidation,
    userIdValidation,
};
