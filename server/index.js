import http from "http";
import app from "./src/app.js";
import { PORT } from "./src/shared/config/envConfig.js";
import connectDB from "./src/shared/config/db.js";

const startServer = async () => {
  try {
    await connectDB();
    const server = http.createServer(app);

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
