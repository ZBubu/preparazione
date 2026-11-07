'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Classroom extends Model {
        static associate(models) {
            models.Classroom.hasMany(models.Lesson, {
                foreignKey: 'classroomId',
                as: 'lessons',
            });
        }
    }
    Classroom.init(
        {
            number: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true,
            },
            coordinates: {
                type: DataTypes.JSON,
                allowNull: false,
            },
            floorId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'Floor',
                    key: 'id',
                },
            },
        },
        {
            sequelize,
            tableName: 'Classroom',
            modelName: 'Classroom',
        },
    );
    return Classroom;
};
