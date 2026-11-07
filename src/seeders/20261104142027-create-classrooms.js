'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // Get the ground floor ID dynamically
        const groundFloorId = await queryInterface.rawSelect(
            'Floor',
            {
                where: { number: 0 },
            },
            'id',
        );

        if (groundFloorId == null) {
            throw new Error('Ground floor not found in the Floors table');
        }

        const now = new Date();

        await queryInterface.bulkInsert('Classroom', [
            {
                number: 121,
                coordinates: '[[499,235],[718,233],[719,470],[499,469]]',
                floorId: groundFloorId,
                createdAt: now,
                updatedAt: now,
            },
            {
                number: 122,
                coordinates: '[[1032,238],[1350,236],[1350,472],[1033,471]]',
                floorId: groundFloorId,
                createdAt: now,
                updatedAt: now,
            },
            {
                number: 123,
                coordinates: '[[498,489],[719,490],[719,726],[498,723]]',
                floorId: groundFloorId,
                createdAt: now,
                updatedAt: now,
            },
            {
                number: 124,
                coordinates: '[[1032,492],[1349,491],[1349,726],[1030,723]]',
                floorId: groundFloorId,
                createdAt: now,
                updatedAt: now,
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('Classroom', null, {});
    },
};
