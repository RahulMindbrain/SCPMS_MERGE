export const getDatabaseUrl = () => {
  const provider = process.env.DB_PROVIDER;

  if (provider === "cloud") {
    return process.env.DATABASE_URL_CLOUD!;
  }

  const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

  return `postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
};
