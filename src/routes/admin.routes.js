// routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { isAdmin } = require('../middlewares/auth.middleware');
const {
    datatableValidation,
    updateUserValidation,
    userBodyValidation,
    userIdValidation,
} = require('../middlewares/validation');

router.get('/utenti', isAdmin, adminController.readUtenti);

router.get('/utenti/datatable', isAdmin, datatableValidation, adminController.datatable);
router.get('/utenti/:id', isAdmin, userIdValidation, adminController.getUtente);
router.post('/utenti', isAdmin, userBodyValidation, adminController.addUtenti);
router.put('/utenti/:id', isAdmin, updateUserValidation, adminController.updateUtenti);
router.delete('/utenti/:id', isAdmin, userIdValidation, adminController.deleteUtenti);

module.exports = router;
