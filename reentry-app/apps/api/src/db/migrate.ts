import type { DatabaseSync } from "node:sqlite";
import { migrations } from "./migrations.js";

export function runMigrations(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    ) STRICT;
  `);

  const applied = db.prepare("SELECT id FROM schema_migrations WHERE id = ?");
  const recordMigration = db.prepare("INSERT INTO schema_migrations (id) VALUES (?)");

  for (const migration of migrations) {
    if (applied.get(migration.id)) continue;

    db.exec("BEGIN");
    try {
      db.exec(migration.sql);
      recordMigration.run(migration.id);
      db.exec("COMMIT");
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  return getMigrationStatus(db);
}

export function getMigrationStatus(db: DatabaseSync) {
  const rows = db
    .prepare("SELECT id, applied_at AS appliedAt FROM schema_migrations ORDER BY applied_at ASC")
    .all();

  return {
    expected: migrations.map((migration) => migration.id),
    applied: rows
  };
}

