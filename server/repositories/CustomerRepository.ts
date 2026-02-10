import { RowDataPacket } from 'mysql2/promise';
import { BaseRepository } from './BaseRepository.js';
import { v4 as uuidv4 } from 'uuid';

export interface Customer extends RowDataPacket {
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

export class CustomerRepository extends BaseRepository {
  constructor() {
    super('customers');
  }

  async getAllActive(): Promise<Customer[]> {
    return this.query<Customer>(
      `SELECT * FROM ${this.tableName} WHERE status = ? ORDER BY name`,
      ['active']
    );
  }

  async create(data: Partial<Customer>): Promise<Customer> {
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

    const customer = await this.findById<Customer>(id);
    if (!customer) throw new Error('Failed to create customer');
    return customer;
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
    const updateData: Record<string, any> = {};
    const fields = ['code', 'name', 'phone', 'email', 'address', 'notes', 'status'];
    
    fields.forEach(field => {
      if (data[field as keyof Customer] !== undefined) {
        updateData[field] = data[field as keyof Customer];
      }
    });

    const success = await this.update(id, updateData);
    if (!success) return null;

    return this.findById<Customer>(id);
  }

  async deleteCustomer(id: string): Promise<boolean> {
    return this.softDelete(id);
  }
}
