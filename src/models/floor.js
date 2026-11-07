'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Floor extends Model {
        static associate(models) {
            models.Floor.hasMany(models.Classroom, {
                foreignKey: 'floorId',
                as: 'classrooms',
            });
        }
    }
    Floor.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            number: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true,
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            image: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: 'Floor',
            modelName: 'Floor',
        },
    );
    return Floor;
};
