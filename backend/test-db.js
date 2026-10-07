require("dotenv").config();

const { Client } = require("pg");

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    await client.connect();

    console.log("? PostgreSQL connection successful!");

    const result = await client.query(`
      SELECT
        current_database() AS database_name,
        version() AS postgres_version,
        PostGIS_Version() AS postgis_version;
    `);

    console.log("Database:", result.rows[0].database_name);
    console.log("PostgreSQL:", result.rows[0].postgres_version.split(" ").slice(0, 2).join(" "));
    console.log("PostGIS:", result.rows[0].postgis_version);

  } catch (error) {
    console.error("? PostgreSQL connection failed!");
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

testConnection();
