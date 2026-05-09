import { app } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

async function startServer() {
  await connectDatabase();

  app.listen(env.PORT, () => {
    console.log(`API listening on http://localhost:${env.PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
