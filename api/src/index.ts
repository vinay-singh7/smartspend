import { app } from "./app";
import { connectDatabase } from "./config/database";
import { env } from "./config/env";

async function bootstrap() {
  await connectDatabase();
  app.listen(env.PORT, () => {
    console.log(`SmartSpend API running on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
