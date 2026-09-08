import http from "http";
import app from "./src/app.js";
import { PORT } from "./src/shared/config/envConfig.js";

const startServer = async () => {
  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();
