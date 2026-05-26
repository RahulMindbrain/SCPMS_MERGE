import { Client } from "pg";

export const ensureDatabaseExists = async () => {
  if (process.env.DB_PROVIDER !== "local") return;

  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  const client = new Client({
    host: DB_HOST,
    port: Number(DB_PORT),
    user: DB_USER,
    password: DB_PASSWORD,
    database: "postgres",
  });

  await client.connect();

  const res = await client.query(
    `SELECT 1 FROM pg_database WHERE datname = $1`,
    [DB_NAME],
  );

  if (res.rowCount === 0) {
    console.log(`Creating DB: ${DB_NAME}`);
    await client.query(`CREATE DATABASE "${DB_NAME}"`);

    await new Promise((resolve) => setTimeout(resolve, 1500));
  } else {
    console.log(`DB exists: ${DB_NAME}`);
  }

  await client.end();
};
