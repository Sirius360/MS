import { RowDataPacket } from 'mysql2/promise';
import { BaseRepository } from './BaseRepository.js';
import { v4 as uuidv4 } from 'uuid';

export interface Supplier extends RowDataPacket {
  id: string;
  code: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  status: string;
  created_at: Date;
  updated_at: Date;
}

export class SupplierRepository extends BaseRepository {
  constructor() {
    super('suppliers');
  }

  async getAllActive(): Promise<Supplier[]> {
    return this.query<Supplier>(
      `SELECT * FROM ${this.tableName} WHERE status = ? ORDER BY name`,
      ['active']
    );
  }

  async create(data: Partial<Supplier>): Promise<Supplier> {
    const id = uuidv4();
    await this.insert({
      id,
      code: data.code || null,
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      notes: data.notes || null,
      status: data.status || 'active',
    });

    const supplier = await this.findById<Supplier>(id);
    if (!supplier) throw new Error('Failed to create supplier');
    return supplier;
  }

  async updateSupplier(id: string, data: Partial<Supplier>): Promise<Supplier | null> {
    const updateData: Record<string, any> = {};
    const fields = ['code', 'name', 'phone', 'email', 'address', 'notes', 'status'];
    
    fields.forEach(field => {
      if (data[field as keyof Supplier] !== undefined) {
        updateData[field] = data[field as keyof Supplier];
      }
    });

    const success = await this.update(id, updateData);
    if (!success) return null;

    return this.findById<Supplier>(id);
  }

  async deleteSupplier(id: string): Promise<boolean> {
    return this.softDelete(id);
  }
}
