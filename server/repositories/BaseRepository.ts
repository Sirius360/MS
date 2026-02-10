import { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';
import pool from '../config/database.js';

export class BaseRepository {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  // Execute query with prepared statement
  protected async query<T extends RowDataPacket>(
    sql: string,
    params: any[] = []
  ): Promise<T[]> {
    const [rows] = await pool.execute<T[]>(sql, params);
    return rows;
  }

  // Execute single row query
  protected async queryOne<T extends RowDataPacket>(
    sql: string,
    params: any[] = []
  ): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows.length > 0 ? rows[0] : null;
  }

  // Execute insert/update/delete
  protected async execute(
    sql: string,
    params: any[] = []
  ): Promise<ResultSetHeader> {
    const [result] = await pool.execute<ResultSetHeader>(sql, params);
    return result;
  }

  // Execute with specific connection (for transactions)
  protected async queryWithConnection<T extends RowDataPacket>(
    connection: PoolConnection,
    sql: string,
    params: any[] = []
  ): Promise<T[]> {
    const [rows] = await connection.execute<T[]>(sql, params);
    return rows;
  }

  protected async executeWithConnection(
    connection: PoolConnection,
    sql: string,
    params: any[] = []
  ): Promise<ResultSetHeader> {
    const [result] = await connection.execute<ResultSetHeader>(sql, params);
    return result;
  }

  // Generic CRUD operations
  async findAll<T extends RowDataPacket>(): Promise<T[]> {
    return this.query<T>(`SELECT * FROM ${this.tableName}`);
  }

  async findById<T extends RowDataPacket>(id: string): Promise<T | null> {
    return this.queryOne<T>(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
  }

  async insert(data: Record<string, any>): Promise<string> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const sql = `
      INSERT INTO ${this.tableName} (${keys.join(', ')})
      VALUES (${placeholders})
    `;
    
    const result = await this.execute(sql, values);
    return data.id || result.insertId.toString();
  }

  async update(id: string, data: Record<string, any>): Promise<boolean> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    
    const sql = `
      UPDATE ${this.tableName}
      SET ${setClause}
      WHERE id = ?
    `;
    
    const result = await this.execute(sql, [...values, id]);
    return result.affectedRows > 0;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.execute(
      `DELETE FROM ${this.tableName} WHERE id = ?`,
      [id]
    );
    return result.affectedRows > 0;
  }

  // Soft delete (update status)
  async softDelete(id: string): Promise<boolean> {
    return this.update(id, { status: 'inactive' });
  }
}
