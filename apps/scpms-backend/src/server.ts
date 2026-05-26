import http from "http";
import app from "./app";
import { getDatabaseUrl } from "./config/db.URL";
import { ensureDatabaseExists } from "./utils/initDB";
import { initializeSocket } from "./socket";

const PORT = Number(process.env.PORT) || 3000;

const startServer = async (): Promise<void> => {
  try {
    process.env.DATABASE_URL = getDatabaseUrl();

    await ensureDatabaseExists();

    const server = http.createServer(app);

    initializeSocket(server);
    console.log("🔥 Socket initialized");

    server.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
