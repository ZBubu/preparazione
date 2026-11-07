const express = require('express');
const multer = require('multer');
const router = express.Router();
const mapController = require('../controllers/map.controller');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, callback) => {
        const fileName = file.originalname.toLowerCase();
        if (!fileName.endsWith('.csv')) {
            callback(new Error('Only CSV files are allowed'));
            return;
        }
        callback(null, true);
    },
});

router.get('/mappa', mapController.readMap);
router.get('/api/classrooms', mapController.getClassrooms);
router.get('/api/lessons', mapController.getLessons);
router.post('/api/lessons/upload', upload.single('csv'), mapController.importCsv);
router.get('/api/search', mapController.search);
module.exports = router;
