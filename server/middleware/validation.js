// ===== server/middleware/validation.js =====
// Request validation middleware using Joi

import Joi from 'joi';

/**
 * Generic validation middleware
 * @param {Joi.Schema} schema - Joi schema to validate against
 * @param {string} property - Property to validate (body, query, params)
 */
export function validate(schema, property = 'body') {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Return all errors, not just the first one
      stripUnknown: true, // Remove unknown properties
      convert: true, // Convert values to proper types
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/['"]/g, ''), // Remove quotes
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors,
      });
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
}

/**
 * Validation schemas for common operations
 */
export const schemas = {
  // Product schemas
  createProduct: Joi.object({
    sku: Joi.string().required().max(50).trim(),
    name: Joi.string().required().max(255).trim(),
    type: Joi.string().valid('product', 'service').default('product'),
    groupId: Joi.string().uuid().allow(null, ''),
    brandId: Joi.string().uuid().allow(null, ''),
    config: Joi.object().allow(null),
    costPrice: Joi.number().min(0).default(0),
    salePriceBeforeTax: Joi.number().min(0).default(0),
    vatImport: Joi.number().min(0).max(100).default(0),
    vatSale: Joi.number().min(0).max(100).default(0),
    stockQty: Joi.number().integer().min(0).default(0),
    minStock: Joi.number().integer().min(0).default(0),
    maxStock: Joi.number().integer().min(0).default(0),
    unit: Joi.string().max(50).default('cái'),
    imageUrl: Joi.string().uri().allow(null, ''),
    images: Joi.array().items(Joi.string()).allow(null),
    notes: Joi.string().allow(null, ''),
    description: Joi.string().allow(null, ''),
    warranty: Joi.string().allow(null, ''),
    directSale: Joi.boolean().default(false),
    loyaltyPoints: Joi.boolean().default(false),
  }),

  updateProduct: Joi.object({
    name: Joi.string().max(255).trim(),
    costPrice: Joi.number().min(0),
    salePriceBeforeTax: Joi.number().min(0),
    vatSale: Joi.number().min(0).max(100),
    stockQty: Joi.number().integer().min(0),
    minStock: Joi.number().integer().min(0),
    maxStock: Joi.number().integer().min(0),
    unit: Joi.string().max(50),
    status: Joi.string().valid('in_stock', 'out_of_stock', 'discontinued'),
    imageUrl: Joi.string().uri().allow(null, ''),
    images: Joi.array().items(Joi.string()).allow(null),
    notes: Joi.string().allow(null, ''),
    description: Joi.string().allow(null, ''),
    warranty: Joi.string().allow(null, ''),
  }).min(1), // At least one field must be present

  // Customer schemas
  createCustomer: Joi.object({
    name: Joi.string().required().max(255).trim(),
    type: Joi.string().valid('retail', 'wholesale').default('retail'),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/).allow(null, ''),
    email: Joi.string().email().allow(null, ''),
    address: Joi.string().allow(null, ''),
    taxCode: Joi.string().allow(null, ''),
    notes: Joi.string().allow(null, ''),
  }),

  updateCustomer: Joi.object({
    name: Joi.string().max(255).trim(),
    type: Joi.string().valid('retail', 'wholesale'),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/),
    email: Joi.string().email(),
    address: Joi.string().allow(null, ''),
    taxCode: Joi.string().allow(null, ''),
    notes: Joi.string().allow(null, ''),
  }).min(1),

  // Supplier schemas
  createSupplier: Joi.object({
    name: Joi.string().required().max(255).trim(),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/).allow(null, ''),
    email: Joi.string().email().allow(null, ''),
    address: Joi.string().allow(null, ''),
    taxCode: Joi.string().allow(null, ''),
    contactPerson: Joi.string().allow(null, ''),
    notes: Joi.string().allow(null, ''),
  }),

  updateSupplier: Joi.object({
    name: Joi.string().max(255).trim(),
    phone: Joi.string().pattern(/^[0-9]{10,11}$/),
    email: Joi.string().email(),
    address: Joi.string().allow(null, ''),
    taxCode: Joi.string().allow(null, ''),
    contactPerson: Joi.string().allow(null, ''),
    notes: Joi.string().allow(null, ''),
  }).min(1),

  // Batch operations
  batchProducts: Joi.object({
    products: Joi.array()
      .items(Joi.object({
        id: Joi.string().uuid(),
        sku: Joi.string().max(50),
        name: Joi.string().max(255),
        costPrice: Joi.number().min(0),
        salePriceBeforeTax: Joi.number().min(0),
        stockQty: Joi.number().integer().min(0),
      }))
      .min(1)
      .max(100) // Max 100 items per batch
      .required(),
  }),

  // Pagination and filters
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(50),
    search: Joi.string().allow(''),
    groupId: Joi.string().uuid(),
    brandId: Joi.string().uuid(),
    status: Joi.string(),
    type: Joi.string(),
  }),
};

export default {
  validate,
  schemas,
};
