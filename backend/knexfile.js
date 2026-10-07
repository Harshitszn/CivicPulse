/**
 * Knex configuration file
 * Used by knex CLI for migrations and seeds.
 * Run: npm run migrate
 */
require('dotenv').config();

const isRemoteDb =
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.includes('supabase.co') ||
    process.env.DATABASE_URL.includes('pooler.supabase.com') ||
    process.env.DATABASE_URL.includes('amazonaws.com') ||
    process.env.NODE_ENV === 'production');

const connection = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'civicpulse',
    };

/** @type {import('knex').Knex.Config} */
const baseConfig = {
  client: 'pg',
  connection,
  pool: { min: 0, max: 7 },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations',
    extension: 'js',
    disableTransactions: true,
    disableLocks: true,
  },
  seeds: {
    directory: './seeders',
    extension: 'js',
  },
};

module.exports = {
  development: {
    ...baseConfig,
    debug: false,
  },

  test: {
    ...baseConfig,
    connection: process.env.DATABASE_URL_TEST || connection,
  },

  production: {
    ...baseConfig,
    pool: { min: 0, max: 10 },
  },
};
