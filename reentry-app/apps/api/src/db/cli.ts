import { closeDatabase, getDatabase, getDatabasePath } from "./client.js";
import { getMigrationStatus, runMigrations } from "./migrate.js";
import { seedDemoData } from "./seed.js";
import { getDatabaseCounts } from "./repository.js";

const command = process.argv[2] ?? "migrate";
const db = getDatabase();

try {
  if (command === "migrate") {
    const status = runMigrations(db);
    console.log(JSON.stringify({ databasePath: getDatabasePath(), migrations: status }, null, 2));
  } else if (command === "seed") {
    runMigrations(db);
    const seed = seedDemoData(db);
    console.log(JSON.stringify({ databasePath: getDatabasePath(), seed, counts: getDatabaseCounts(db) }, null, 2));
  } else if (command === "status") {
    console.log(
      JSON.stringify(
        {
          databasePath: getDatabasePath(),
          migrations: getMigrationStatus(db),
          counts: getDatabaseCounts(db)
        },
        null,
        2
      )
    );
  } else {
    console.error(`Unknown db command: ${command}`);
    process.exitCode = 1;
  }
} finally {
  closeDatabase();
}

