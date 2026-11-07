'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('Floor', [
            {
                number: 0,
                name: 'Piano Terra',
                image: '/images/floor0.png',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                number: 1,
                name: 'Primo Piano',
                image: '/images/floor1.png',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                number: 2,
                name: 'Secondo Piano',
                image: '/images/floor2.png',
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Floor', null, {});
    },
};
