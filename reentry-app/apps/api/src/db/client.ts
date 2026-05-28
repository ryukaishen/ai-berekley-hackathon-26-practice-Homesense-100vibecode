import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

let database: DatabaseSync | null = null;

export function getDatabasePath() {
  if (process.env.REENTRY_DB_PATH) {
    return resolve(process.env.REENTRY_DB_PATH);
  }

  const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
  return resolve(appRoot, "data", "reentry.sqlite");
}

export function getDatabase() {
  if (database) return database;

  const databasePath = getDatabasePath();
  mkdirSync(dirname(databasePath), { recursive: true });

  database = new DatabaseSync(databasePath);
  database.exec("PRAGMA foreign_keys = ON;");
  database.exec("PRAGMA journal_mode = WAL;");

  return database;
}

export function closeDatabase() {
  database?.close();
  database = null;
}

