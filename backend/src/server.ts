import { createApp } from "./app.js";
import { db, ensureRoles } from "./db.js";
import { env } from "./config.js";
await ensureRoles();
const server = createApp().listen(env.PORT, () =>
  console.log(`PeopleSpace API listening on ${env.PORT}`),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    server.close(() => {
      void db.$disconnect().then(() => process.exit(0));
    });
  });
