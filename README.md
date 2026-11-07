# Progetto

Web application developed with **Node.js, Express 5, EJS, Sequelize and MySQL**.

## 1. Technologies and dependencies

### Main dependencies

| Package             | Description                                                      |
| ------------------- | ---------------------------------------------------------------- |
| `express`           | Web framework for handling HTTP requests, routes and middleware. |
| `ejs`               | Template engine for generating dynamic HTML pages.               |
| `sequelize`         | ORM for interacting with relational databases.                   |
| `mysql2`            | MySQL driver used by Sequelize.                                  |
| `bcrypt`            | Password hashing and verification.                               |
| `express-session`   | Session management for user authentication.                      |
| `express-validator` | Validation and sanitization of incoming request data.            |
| `dotenv`            | Loads environment variables from `.env` files.                   |
| `pino`              | Structured application logging.                                  |
| `pino-http`         | HTTP request logging for Express.                                |

### Development dependencies

| Package         | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `nodemon`       | Automatically restarts the server when files change.         |
| `eslint`        | Static code analysis and detection of potential errors.      |
| `prettier`      | Automatic code formatting.                                   |
| `pino-pretty`   | Makes Pino logs easier to read during development.           |
| `sequelize-cli` | Command-line interface for Sequelize migrations and seeders. |
| `supertest`     | HTTP testing for Express applications.                       |

---

## 2. Requirements

Before starting, make sure you have installed:

- Node.js (LTS recommended).
- npm.
- MySQL Server.
- Git (optional).

Check your installed versions:

```bash
node --version
npm --version
```

---

## 3. Installation

Clone the repository:

```bash
git clone <repository-url>
```

Enter the project directory:

```bash
cd progetto
```

Install all dependencies:

```bash
npm install
```

This installs the packages listed in `package.json`.

---

## 4. Environment configuration

Create a `.env` file in the project root.

Example:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=progetto
DB_USER=root
DB_PASSWORD=your_password

# Session
SESSION_SECRET=your_long_random_secret

# Logging
LOG_LEVEL=debug
```

The application uses `dotenv` to load environment variables.

Example:

```javascript
require('dotenv').config();

const port = process.env.PORT || 3000;
```

**Important:** Never commit `.env` files to Git. Add `.env` to `.gitignore`.

You can provide a `.env.example` file containing the required variable names without actual credentials.

---

## 5. Available commands

### Application

| Command     | Description                           |
| ----------- | ------------------------------------- |
| `npm start` | Starts the application using Nodemon. |

Run the application:

```bash
npm start
```

Nodemon automatically restarts the server when changes are detected.

### ESLint

ESLint checks the JavaScript code for potential errors and coding problems.

| Command            | Description                                |
| ------------------ | ------------------------------------------ |
| `npm run lint`     | Analyzes the project and reports problems. |
| `npm run lint:fix` | Automatically fixes supported problems.    |

Examples:

```bash
npm run lint
npm run lint:fix
```

### Prettier

Prettier automatically formats source code according to the project's formatting configuration.

If you have configured the following scripts:

```json
{
    "format": "prettier . --write",
    "format:check": "prettier . --check"
}
```

You can use:

| Command                | Description                                |
| ---------------------- | ------------------------------------------ |
| `npm run format`       | Formats the project.                       |
| `npm run format:check` | Checks formatting without modifying files. |

### Testing

The project includes Supertest for HTTP endpoint testing.

The current `test` script is a placeholder and must be replaced with a real test runner before automated tests can be executed.

---

## 6. Database management (Sequelize)

Sequelize is used as the ORM to interact with MySQL.

The project also includes `sequelize-cli`, which provides commands for database migrations and seeders.

### Database initialization

Create the database in MySQL before starting the application.

```sql
CREATE DATABASE progetto;
```

### Sequelize CLI commands

If Sequelize CLI is configured with the appropriate directories:

| Command                               | Description                                              |
| ------------------------------------- | -------------------------------------------------------- |
| `npx sequelize-cli init`              | Generates the default Sequelize CLI directory structure. |
| `npx sequelize-cli db:migrate`        | Executes pending migrations.                             |
| `npx sequelize-cli db:migrate:undo`   | Reverts the latest migration.                            |
| `npx sequelize-cli db:migrate:status` | Displays migration status.                               |
| `npx sequelize-cli seed:all`          | Executes all seeders.                                    |
| `npx sequelize-cli db:seed:undo:all`  | Reverts all seeders.                                     |

### Generate a model and migration

```bash
npx sequelize-cli model:generate --name User --attributes username:string,email:string,password:string
```

This generates a model and its corresponding migration.

### Generate a migration

```bash
npx sequelize-cli migration:generate --name create-users
```

### Generate a seeder

```bash
npx sequelize-cli seed:generate --name demo-users
```

**Note:** Sequelize CLI commands require the appropriate configuration. Make sure the CLI configuration, database connection and migration paths match the project structure.

---

## 7. Authentication and security

The project includes the following security-related packages:

| Package             | Purpose                                               |
| ------------------- | ----------------------------------------------------- |
| `bcrypt`            | Hashes passwords before storing them in the database. |
| `express-session`   | Maintains authenticated user sessions.                |
| `express-validator` | Validates and sanitizes incoming data.                |

### Password hashing example

```javascript
const bcrypt = require('bcrypt');

const hashedPassword = await bcrypt.hash(password, 12);

const isValid = await bcrypt.compare(password, hashedPassword);
```

Never store plaintext passwords.

### Input validation

Use `express-validator` in route middleware to validate incoming data before it reaches the controllers.

---

## 8. Logging

The project uses Pino for centralized structured logging.

| Environment | Recommended log level |
| ----------- | --------------------- |
| Development | `debug`               |
| Production  | `info`                |

Example:

```javascript
logger.info({ userId: user.id }, 'User logged in');

logger.warn({ userId: user.id }, 'Unauthorized access attempt');

logger.error({ err: error }, 'Database operation failed');
```

Use structured logging and never log passwords, session cookies or authentication tokens.

---

## 9. Testing

Supertest is included for testing HTTP endpoints.

Example:

```javascript
const request = require('supertest');
const app = require('../app');

describe('GET /', () => {
    it('should return HTTP 200', async () => {
        const response = await request(app).get('/');

        expect(response.status).toBe(200);
    });
});
```

This example requires a test runner such as Jest or Mocha, which is not currently included in the dependencies.

Supertest allows testing HTTP endpoints without manually starting the server.

---

## 10. Git and project maintenance

Before committing changes, run:

```bash
npm run lint
npm run format:check
```

To automatically fix formatting and supported linting problems:

```bash
npm run lint:fix
npm run format
```

Keep environment files, dependencies and generated files out of version control where appropriate.

Example `.gitignore`:

```gitignore
node_modules/
.env
coverage/
dist/
```

---

## 11. Useful commands reference

| Command                                       | Description                                     |
| --------------------------------------------- | ----------------------------------------------- |
| `npm install`                                 | Installs project dependencies.                  |
| `npm start`                                   | Starts the application.                         |
| `npm run lint`                                | Checks code quality.                            |
| `npm run lint:fix`                            | Fixes supported ESLint problems.                |
| `npm run format`                              | Formats source files (after adding the script). |
| `npm run format:check`                        | Checks formatting (after adding the script).    |
| `npm test`                                    | Runs the current placeholder test script.       |
| `npx sequelize-cli db:migrate`                | Runs database migrations.                       |
| `npx sequelize-cli migration:generate --name` | Creates a new migration.                        |
| `npx sequelize-cli db:migrate:undo`           | Reverts the latest migration.                   |
| `npx sequelize-cli db:seed:all`               | Executes database seeders.                      |
| `npx sequelize-cli seed:generate --name`      | Creates a new seeder file.                      |

---

## 12. Development conventions

To maintain a consistent and maintainable codebase:

1. Keep database operations inside models or service layers.
2. Keep HTTP request handling inside controllers.
3. Separate routes from business logic.
4. Use middleware for authentication, authorization and request validation.
5. Store configuration and secrets in environment variables.
6. Use Pino for application logging instead of `console.log()`.
7. Use ESLint to detect programming errors.
8. Use Prettier to maintain consistent formatting.
9. Use Sequelize migrations to manage database schema changes.
10. Write automated tests for important application functionality.

---

**Project status:** Under development.
