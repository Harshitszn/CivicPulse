/**
 * Knex configuration file
 * Used by knex CLI for migrations and seeds.
 * Run: npx knex migrate:latest --knexfile knexfile.js
 */
require('dotenv').config();

/** @type {import('knex').Knex.Config} */
const baseConfig = {
  client: 'postgresql',
  pool: { min: 2, max: 10 },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
    extension: 'js',
  },
  seeds: {
    directory: './seeders',
    extension: 'js',
  },
};

module.exports = {
  development: {
    ...baseConfig,
    connection: process.env.DATABASE_URL,
    debug: false,
  },

  test: {
    ...baseConfig,
    connection: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL,
  },

  production: {
    ...baseConfig,
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    pool: { min: 2, max: 20 },
  },
};
