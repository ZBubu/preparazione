const fs = require('fs');
const path = require('path');
const logger = require('../config/logger');
const { Classroom, Lesson, Floor } = require('../models');
const { Op } = require('sequelize');

const dayMap = {
    Lun: 'Monday',
    Mar: 'Tuesday',
    Mer: 'Wednesday',
    Gio: 'Thursday',
    Ven: 'Friday',
    Sab: 'Saturday',
    Dom: 'Sunday',
};

const parseCsvLine = (line) => {
    const values = [];
    let current = '';
    let quoted = false;

    for (let index = 0; index < line.length; index++) {
        const character = line[index];

        if (character === '"') {
            if (quoted && line[index + 1] === '"') {
                current += '"';
                index++;
            } else {
                quoted = !quoted;
            }
        } else if (character === ';' && !quoted) {
            values.push(current.trim());
            current = '';
        } else {
            current += character;
        }
    }

    values.push(current.trim());
    return values;
};

const getCsvContent = (req) => {
    if (req.file?.buffer) {
        return req.file.buffer.toString('utf8').replace(/^\uFEFF/, '');
    }

    if (req.file?.path) {
        return fs.readFileSync(req.file.path, 'utf8').replace(/^\uFEFF/, '');
    }

    if (typeof req.body?.csv === 'string') {
        return req.body.csv.replace(/^\uFEFF/, '');
    }

    const defaultCsv = path.join(__dirname, '..', 'config', 'orario.csv');
    return fs.readFileSync(defaultCsv, 'utf8').replace(/^\uFEFF/, '');
};

exports.readMap = async (req, res) => {
    try {
        const floors = await Floor.findAll({
            attributes: ['id', 'number', 'name', 'image'],
            order: [['number', 'ASC']],
            raw: true,
        });

        res.render('building', {
            User: req.User,
            title: 'Visualizzazione Aule',
            floors,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Unable to load building');
    }
};

exports.getClassrooms = async (req, res) => {
    try {
        const floorId = Number(req.query.floorId);

        if (!Number.isInteger(floorId) || floorId <= 0) {
            return res.status(400).json({
                error: 'Invalid floor ID',
            });
        }

        const floor = await Floor.findByPk(floorId);

        if (!floor) {
            return res.status(404).json({
                error: 'Floor not found',
            });
        }

        const classrooms = await Classroom.findAll({
            where: { floorId },
            attributes: ['id', 'number', 'coordinates'],
            order: [['number', 'ASC']],
        });

        res.json({
            floor: {
                id: floor.id,
                number: floor.number,
                name: floor.name,
                image: floor.image,
            },
            width: floor.imageWidth ?? 1664,
            height: floor.imageHeight ?? 1170,
            classrooms: classrooms.map((classroom) => ({
                id: classroom.id,
                number: classroom.number,
                floorId,
                points:
                    typeof classroom.coordinates === 'string'
                        ? JSON.parse(classroom.coordinates)
                        : classroom.coordinates,
            })),
        });
    } catch (error) {
        logger.error({ error }, 'Error fetching classrooms');

        res.status(500).json({
            error: 'Internal server error',
        });
    }
};

exports.getLessons = async (req, res) => {
    try {
        const { day } = req.query;
        const dayNames = {
            Lun: 'Monday',
            Mar: 'Tuesday',
            Mer: 'Wednesday',
            Gio: 'Thursday',
            Ven: 'Friday',
            Sab: 'Saturday',
            Dom: 'Sunday',
        };
        const databaseDay = dayNames[day] || day;

        const lessons = await Lesson.findAll({
            where: {
                Day: databaseDay,
            },
            include: [
                {
                    model: Classroom,
                    as: 'classroom',
                    attributes: ['id', 'number'],
                },
            ],
        });

        res.json(lessons);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Unable to retrieve lessons',
        });
    }
};

exports.importCsv = async (req, res) => {
    try {
        const lines = getCsvContent(req)
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);

        if (lines.length === 0) {
            logger.warn('The CSV file is empty or does not contain enough data');
            return res.status(400).json({ error: 'The CSV file is empty' });
        }

        const headers = parseCsvLine(lines[0]);
        const rows = lines.slice(1).map(parseCsvLine);

        const requiredHeaders = [
            'aula',
            'giorno',
            'ora_inizio',
            'ora_fine',
            'classe',
            'docente',
            'materia',
        ];
        const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));
        if (missingHeaders.length > 0) {
            return res.status(400).json({
                error: `Missing CSV columns: ${missingHeaders.join(', ')}`,
            });
        }

        const column = (name) => headers.indexOf(name);
        const classrooms = await Classroom.findAll({ attributes: ['id', 'number'] });
        const classroomByNumber = new Map(
            classrooms.map((classroom) => [String(classroom.number).trim(), classroom.id]),
        );
        const lessons = [];
        const unknownClassrooms = new Set();

        for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
            const values = rows[rowIndex];
            const classroomNumber = values[column('aula')]?.trim();
            const italianDay = values[column('giorno')]?.trim();
            const Day = dayMap[italianDay];

            if (
                !classroomNumber ||
                !Day ||
                !values[column('ora_inizio')] ||
                !values[column('ora_fine')] ||
                !values[column('classe')] ||
                !values[column('docente')] ||
                !values[column('materia')]
            ) {
                return res.status(400).json({
                    error: `Invalid CSV row ${rowIndex + 2}`,
                });
            }

            const classroomId = classroomByNumber.get(classroomNumber);
            if (!classroomId) {
                unknownClassrooms.add(classroomNumber);
                continue;
            }

            lessons.push({
                day: Day,
                startTime: values[column('ora_inizio')],
                endTime: values[column('ora_fine')],
                schoolClass: values[column('classe')],
                teacher: values[column('docente')],
                subject: values[column('materia')],
                classroomId: classroomId,
            });
        }

        if (unknownClassrooms.size > 0) {
            return res.status(400).json({
                error: `Unknown classrooms: ${[...unknownClassrooms].join(', ')}`,
            });
        }

        const transaction = await Lesson.sequelize.transaction();
        try {
            await Lesson.destroy({ where: {}, transaction });
            await Lesson.bulkCreate(lessons, { transaction });
            await transaction.commit();
        } catch (error) {
            await transaction.rollback();
            throw error;
        }

        return res.status(200).json({
            success: true,
            imported: lessons.length,
        });
    } catch (error) {
        logger.error({ error }, 'Error importing CSV timetable');
        return res.status(500).json({ error: 'Unable to import the CSV file' });
    }
};

const querySearch = async (query) => {
    const q = query.trim();

    const lessons = await Lesson.findAll({
        where: {
            [Op.and]: [
                { subject: { [Op.not]: null } },
                { subject: { [Op.ne]: '' } },
                {
                    [Op.or]: [
                        { subject: { [Op.like]: `%${q}%` } },
                        { teacher: { [Op.like]: `%${q}%` } },
                    ],
                },
            ],
        },

        include: [
            {
                model: Classroom,
                as: 'classroom',
                attributes: ['id', 'number'],
            },
        ],

        limit: 20,
    });

    return { lessons };
};

exports.search = async (req, res) => {
    try {
        const {
            mode = 'subject',
            q = '',
            day = 'Monday',
            time = '08:00',
            floor = 'all',
            exactTime = 'true',
        } = req.query;

        const query = String(q).trim();
        const validModes = ['classroom', 'subject', 'teacher'];
        const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

        if (
            !validModes.includes(mode) ||
            !validDays.includes(day) ||
            !/^([01]\d|2[0-3]):[0-5]\d$/.test(time) ||
            (floor !== 'all' && !/^\d+$/.test(floor))
        ) {
            return res.status(400).json({
                error: 'Parametri di ricerca non validi',
            });
        }

        if (query.length < 1 || query.length > 100) {
            return res.json({ classrooms: [], lessons: [] });
        }

        const classroomWhere = {};

        if (floor !== 'all') {
            classroomWhere.floor = Number(floor);
        }

        const activeAtTime = {
            startTime: { [Op.lte]: `${time}:00` },
            endTime: { [Op.gt]: `${time}:00` },
        };

        if (mode === 'classroom') {
            const classrooms = await Classroom.findAll({
                where: {
                    ...classroomWhere,
                    number: { [Op.like]: `%${query}%` },
                },
                order: [['number', 'ASC']],
                limit: 30,
            });

            const ids = classrooms.map((c) => c.id);

            const lessons = ids.length
                ? await Lesson.findAll({
                      where: {
                          classroomId: { [Op.in]: ids },
                          day,
                          ...activeAtTime,
                      },
                  })
                : [];

            const occupiedByClassroom = new Map(lessons.map((l) => [String(l.classroomId), l]));

            return res.json({
                classrooms: classrooms.map((c) => ({
                    ...c.toJSON(),
                    status: occupiedByClassroom.has(String(c.id)) ? 'occupied' : 'free',
                    currentLesson: occupiedByClassroom.get(String(c.id)) ?? null,
                })),
                lessons: [],
            });
        }

        const lessonWhere = {
            day,
            [mode === 'subject' ? 'subject' : 'teacher']: {
                [Op.like]: `%${query}%`,
            },
        };

        if (exactTime === 'true') {
            Object.assign(lessonWhere, activeAtTime);
        }

        const lessons = await Lesson.findAll({
            where: lessonWhere,
            include: [
                {
                    model: Classroom,
                    as: 'classroom',
                    required: true,
                    where: classroomWhere,
                },
            ],
            order: [['startTime', 'ASC']],
            limit: 100,
        });

        return res.json({
            classrooms: [],
            lessons,
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Errore durante la ricerca' });
    }
};
