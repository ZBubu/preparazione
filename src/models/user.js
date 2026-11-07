'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        static associate(_models) {}
    }
    User.init(
        {
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            type: {
                type: DataTypes.ENUM('admin', 'viewer'),
                allowNull: false,
                defaultValue: 'viewer',
            },
        },
        {
            sequelize,
            tableName: 'User',
            modelName: 'User',
        },
    );
    return User;
};
