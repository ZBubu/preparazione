'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('Password&1', 10);
        await queryInterface.bulkInsert('User', [
            {
                email: 'admin@aule.ch',
                password: hashedPassword,
                type: 'admin',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                email: 'viewer@aule.ch',
                password: hashedPassword,
                type: 'viewer',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('User', null, {});
    },
};
