//database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const logger = require('./logger');

// Create a Sequelize instance
const sequelize = new Sequelize({
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
});
// Function used to test the connection to the database.
async function connectDB() {
    try {
        logger.info(
            {
                host: process.env.DB_HOST,
                database: process.env.DB_NAME,
                port: process.env.DB_PORT || 3306,
            },
            'Connecting to MySQL database...',
        );
        // Authenticate checks whether Sequelize can successfully
        // connect to the MySQL database using the provided credentials.
        await sequelize.authenticate();

        logger.info('MySQL database connected successfully.');
    } catch (error) {
        logger.error({ err: error }, 'Unable to connect to MySQL database');
        throw error;
    }
}

module.exports = { sequelize, connectDB };
