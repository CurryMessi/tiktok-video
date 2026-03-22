import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// 数据库文件存放在项目根目录的 data/ 下
const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "tiktok-video.db");

// 确保 data 目录存在
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// 单例模式，避免重复创建连接
let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    // 开启 WAL 模式，提升并发读写性能
    db.pragma("journal_mode = WAL");
    // 初始化表结构
    initTables(db);
  }
  return db;
}

function initTables(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'uploading',
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL DEFAULT 0,
      duration REAL,
      resolution TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      segments TEXT NOT NULL DEFAULT '[]',
      result TEXT,
      error TEXT,
      progress INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at);
    CREATE INDEX IF NOT EXISTS idx_analyses_status ON analyses(status);
  `);
}

export default getDb;
