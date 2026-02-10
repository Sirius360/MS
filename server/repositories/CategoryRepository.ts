import { RowDataPacket } from 'mysql2/promise';
import { BaseRepository } from './BaseRepository.js';
import { v4 as uuidv4 } from 'uuid';

export interface Category extends RowDataPacket {
  id: string;
  name: string;
  description: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export class CategoryRepository extends BaseRepository {
  constructor() {
    super('categories');
  }

  async getAllActive(): Promise<Category[]> {
    return this.query<Category>(
      `SELECT * FROM ${this.tableName} WHERE status = ? ORDER BY name`,
      ['active']
    );
  }

  async create(data: {
    name: string;
    description?: string;
    status?: string;
  }): Promise<Category> {
    const id = uuidv4();
    await this.insert({
      id,
      name: data.name,
      description: data.description || null,
      status: data.status || 'active',
    });
    
    const category = await this.findById<Category>(id);
    if (!category) throw new Error('Failed to create category');
    return category;
  }

  async updateCategory(id: string, data: {
    name?: string;
    description?: string;
    status?: string;
  }): Promise<Category | null> {
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    
    const success = await this.update(id, updateData);
    if (!success) return null;
    
    return this.findById<Category>(id);
  }

  async deleteCategory(id: string): Promise<boolean> {
    // Soft delete by setting status to inactive
    return this.softDelete(id);
  }
}
