'use strict';

module.exports = (sequelize, DataTypes) => {
    const Lesson = sequelize.define(
        'Lesson',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },

            classroomId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Classroom',
                    key: 'id',
                },
            },

            day: {
                type: DataTypes.ENUM(
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                ),
                allowNull: false,
            },

            startTime: {
                type: DataTypes.TIME,
                allowNull: false,
            },

            endTime: {
                type: DataTypes.TIME,
                allowNull: false,
            },

            schoolClass: {
                type: DataTypes.STRING,
                allowNull: false,
            },

            teacher: {
                type: DataTypes.STRING,
                allowNull: true,
            },

            subject: {
                type: DataTypes.STRING,
                allowNull: true,
            },
        },
        {
            tableName: 'Lesson',
            timestamps: true,
        },
    );

    Lesson.associate = (models) => {
        Lesson.belongsTo(models.Classroom, {
            foreignKey: 'classroomId',
            as: 'classroom',
        });
    };

    return Lesson;
};
