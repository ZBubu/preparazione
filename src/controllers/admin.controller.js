// controllers/admin.controller.js
const { User } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const logger = require('../config/logger');

// Colonne ordinabili, nello stesso ordine dell'array "columns" passato al partial EJS
const COLONNE_ORDINABILI = ['email', 'type', 'createdAt'];

exports.datatable = async (req, res) => {
    try {
        const draw = parseInt(req.query.draw, 10) || 0;
        const start = parseInt(req.query.start, 10) || 0;
        const length = parseInt(req.query.length, 10) || 10;
        const searchValue =
            req.query.search && req.query.search.value ? req.query.search.value.trim() : '';

        // Ordinamento
        let order = [['createdAt', 'DESC']];
        if (req.query.order && req.query.order.length > 0) {
            const colIndex = parseInt(req.query.order[0].column, 10);
            const dir = req.query.order[0].dir === 'asc' ? 'ASC' : 'DESC';
            const colName = COLONNE_ORDINABILI[colIndex];
            if (colName) {
                order = [[colName, dir]];
            }
        }

        // Filtro di ricerca
        let where = {};
        if (searchValue) {
            where = {
                [Op.or]: [
                    { email: { [Op.like]: `%${searchValue}%` } },
                    { type: { [Op.like]: `%${searchValue}%` } },
                ],
            };
        }

        const recordsTotal = await User.count();

        const { count: recordsFiltered, rows } = await User.findAndCountAll({
            where,
            order,
            limit: length === -1 ? undefined : length,
            offset: length === -1 ? undefined : start,
            attributes: { exclude: ['password'] },
        });

        return res.json({
            draw,
            recordsTotal,
            recordsFiltered,
            data: rows,
        });
    } catch (err) {
        logger.error({ error: err.message }, 'Error users datatable');
        return res.status(500).json({ error: 'Errore durante il recupero degli utenti' });
    }
};

exports.readUtenti = async (req, res) => {
    res.render('utenti', {
        User: req.user,
        title: 'Gestione utenti - Mappa Aule',
    });
};

exports.getUtente = async (req, res) => {
    try {
        const { id } = req.params;

        const utente = await User.findByPk(id, {
            attributes: { exclude: ['password'] },
        });

        if (!utente) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json(utente);
    } catch (err) {
        logger.error({ error: err.message, userId: req.params.id }, 'Error fetching User');
        return res.status(500).json({ error: 'Errore durante il recupero degli utenti' });
    }
};

exports.addUtenti = async (req, res) => {
    try {
        const { email, password, type } = req.body;

        if (!email || !password || !type) {
            logger.warn({ email, type }, 'Missing required fields for creating User');
            return res.status(400).json({ error: 'Email, password and type are required' });
        }

        const esistente = await User.findOne({ where: { email } });
        if (esistente) {
            logger.warn({ email }, 'Attempt to create User with existing email');
            return res.status(400).json({ error: 'A user already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const nuovoUser = await User.create({
            email,
            password: hashedPassword,
            type,
        });

        logger.info(
            { userId: nuovoUser.id, email: nuovoUser.email, type: nuovoUser.type },
            `User succesfully created`,
        );

        return res.status(201).json({
            message: 'User creato con successo',
            id: nuovoUser.id,
            email: nuovoUser.email,
            type: nuovoUser.type,
        });
    } catch (err) {
        logger.error({ error: err.message, userId: req.params.id }, 'Error creating User');
        return res.status(500).json({ error: "Errore durante la creazione dell'User" });
    }
};

exports.updateUtenti = async (req, res) => {
    try {
        const { id } = req.params;
        const { email, password, type } = req.body;

        const utente = await User.findByPk(id);
        if (!utente) {
            logger.warn({ userId: id }, 'Attempt to update non-existing User');
            return res.status(404).json({ error: 'User not found' });
        }

        if (email && email !== utente.email) {
            const esistente = await User.findOne({ where: { email } });
            if (esistente) {
                logger.warn({ email }, 'Attempt to update User with existing email');
                return res.status(400).json({ error: 'A user already exists with this email' });
            }
            utente.email = email;
        }

        if (type) {
            utente.type = type;
        }

        // La password viene aggiornata solo se è stata effettivamente inviata
        if (password) {
            utente.password = await bcrypt.hash(password, 10);
        }

        await utente.save();

        logger.info(
            { userId: utente.id, email: utente.email, type: utente.type },
            'User successfully updated ',
        );

        return res.status(200).json({
            message: 'User aggiornato con successo',
            id: utente.id,
            email: utente.email,
            type: utente.type,
        });
    } catch (err) {
        logger.error({ error: err.message, userId: req.params.id }, 'Error updating User');
        return res.status(500).json({ error: "Errore durante l'aggiornamento dell'User" });
    }
};

exports.deleteUtenti = async (req, res) => {
    try {
        const { id } = req.params;

        // Evita che un admin elimini se stesso e resti bloccato fuori dal pannello
        if (req.user && String(req.user.id) === String(id)) {
            return res.status(400).json({ error: 'Non puoi eliminare il tuo stesso account' });
        }

        const utente = await User.findByPk(id);
        if (!utente) {
            logger.warn({ userId: id }, 'Attempt to delete non-existing User');
            return res.status(404).json({ error: 'User not found' });
        }

        await utente.destroy();

        logger.info(
            { userId: id, email: utente.email, type: utente.type },
            'User succesfully deleted ',
        );

        return res.status(200).json({ message: 'User eliminato con successo' });
    } catch (err) {
        logger.error({ error: err.message, userId: req.params.id }, 'Error deleting User');
        return res.status(500).json({ error: "Errore durante l'eliminazione dell'User" });
    }
};
