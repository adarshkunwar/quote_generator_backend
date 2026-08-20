import Database from "better-sqlite3";
import { existsSync, mkdirSync } from "fs";

const DATA_DIR = process.env.DATA_DIR || "data";
const DB_FILE = `${DATA_DIR}/quotes.db`;

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(DB_FILE);
db.pragma("journal_mode = WAL");

db.exec(`
CREATE TABLE IF NOT EXISTS prompt_list (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prompt TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS generated_quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote TEXT NOT NULL,
  prompt_id INTEGER REFERENCES prompt_list(id),
  score INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);
