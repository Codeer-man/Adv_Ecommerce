import app from "./app";
import { ConnectToDB } from "./config/db";
import http from "http";

const PORT = process.env.PORT;

async function startServer() {
  await ConnectToDB();

  const server = http.createServer(app);

  server.listen(PORT, () => {
    console.log(`Server running in port http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("failed to start serverr", err);
  process.exit(1);
});
