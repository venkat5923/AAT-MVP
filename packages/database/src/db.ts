import initSqlJs, { Database } from 'sql.js';
import { Pool } from 'pg';
import path from 'path';
import fs from 'fs';
import { config } from '@aat/config';
import { logger } from '@aat/observability';

export interface DatabaseClient {
  query<T = any>(sql: string, params?: any[]): Promise<T[]>;
  queryOne<T = any>(sql: string, params?: any[]): Promise<T | null>;
  execute(sql: string, params?: any[]): Promise<{ changes: number; lastInsertRowid?: number | string }>;
  transaction<T>(callback: (client: DatabaseClient) => Promise<T> | T): Promise<T>;
  close(): Promise<void>;
  isPostgres(): boolean;
}

class SqlJsDatabaseClient implements DatabaseClient {
  private db!: Database;
  private filePath: string;
  private initPromise: Promise<void>;

  constructor(filePath: string) {
    this.filePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
    this.initPromise = this.init();
  }

  private async init(): Promise<void> {
    const SQL = await initSqlJs();
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.filePath)) {
      const fileBuffer = fs.readFileSync(this.filePath);
      this.db = new SQL.Database(fileBuffer);
    } else {
      this.db = new SQL.Database();
      this.persist();
    }
  }

  private inTransaction = false;

  private persist(): void {
    if (this.inTransaction) return;
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.filePath, buffer);
    } catch (err) {
      logger.error('Failed to persist SQLite database to disk', err);
    }
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    await this.initPromise;
    try {
      const stmt = this.db.prepare(sql);
      stmt.bind(params);
      const results: T[] = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject() as T);
      }
      stmt.free();
      return results;
    } catch (err: any) {
      throw new Error(`SQL query failed: ${err.message} in "${sql}"`);
    }
  }

  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  async execute(sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid?: number | string }> {
    await this.initPromise;
    try {
      this.db.run(sql, params);
      if (!this.inTransaction) {
        this.persist();
      }
      const changesRes = this.db.exec('SELECT changes() as changes, last_insert_rowid() as id');
      const changes = (changesRes[0]?.values[0]?.[0] as number) || 1;
      const lastInsertRowid = changesRes[0]?.values[0]?.[1] as number;
      return { changes, lastInsertRowid };
    } catch (err: any) {
      throw new Error(`SQL execute failed: ${err.message} in "${sql}"`);
    }
  }

  async transaction<T>(callback: (client: DatabaseClient) => Promise<T> | T): Promise<T> {
    await this.initPromise;
    this.inTransaction = true;
    this.db.exec('BEGIN TRANSACTION;');
    try {
      const result = await callback(this);
      this.db.exec('COMMIT;');
      this.inTransaction = false;
      this.persist();
      return result;
    } catch (err: any) {
      try {
        this.db.exec('ROLLBACK;');
      } catch {
        // transaction may already have been rolled back
      }
      this.inTransaction = false;
      throw err;
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      this.persist();
      this.db.close();
    }
  }

  isPostgres(): boolean {
    return false;
  }
}

class PostgresDatabaseClient implements DatabaseClient {
  private pool: Pool;

  constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
  }

  private convertPlaceholders(sql: string): string {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
  }

  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    const pgSql = this.convertPlaceholders(sql);
    const res = await this.pool.query(pgSql, params);
    return res.rows as T[];
  }

  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  async execute(sql: string, params: any[] = []): Promise<{ changes: number; lastInsertRowid?: number | string }> {
    const pgSql = this.convertPlaceholders(sql);
    const res = await this.pool.query(pgSql, params);
    return { changes: res.rowCount || 0 };
  }

  async transaction<T>(callback: (client: DatabaseClient) => Promise<T> | T): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      const scopedClient: DatabaseClient = {
        query: async <K = any>(sql: string, params: any[] = []) => {
          const pgSql = this.convertPlaceholders(sql);
          const res = await client.query(pgSql, params);
          return res.rows as K[];
        },
        queryOne: async <K = any>(sql: string, params: any[] = []) => {
          const rows = await scopedClient.query<K>(sql, params);
          return rows.length > 0 ? rows[0] : null;
        },
        execute: async (sql: string, params: any[] = []) => {
          const pgSql = this.convertPlaceholders(sql);
          const res = await client.query(pgSql, params);
          return { changes: res.rowCount || 0 };
        },
        transaction: () => {
          throw new Error('Nested transactions not supported');
        },
        close: async () => {},
        isPostgres: () => true,
      };
      const result = await callback(scopedClient);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  isPostgres(): boolean {
    return true;
  }
}

let dbInstance: DatabaseClient | null = null;

export function getDatabase(): DatabaseClient {
  if (!dbInstance) {
    if (config.database.type === 'postgres' && config.database.url) {
      logger.info('Initializing PostgreSQL connection pool');
      dbInstance = new PostgresDatabaseClient(config.database.url);
    } else {
      logger.info('Initializing WebAssembly SQLite database engine', { file: config.database.file });
      dbInstance = new SqlJsDatabaseClient(config.database.file);
    }
  }
  return dbInstance;
}
