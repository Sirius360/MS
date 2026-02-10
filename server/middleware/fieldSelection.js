// ===== server/middleware/fieldSelection.js =====
// Field selection middleware for sparse fieldsets

/**
 * Field selection middleware
 * Allows clients to request specific fields using ?fields=id,name,price
 */
export function fieldSelection(req, res, next) {
  const originalJson = res.json.bind(res);
  
  res.json = function (data) {
    const fields = req.query.fields;
    
    // If no field selection requested, return original data
    if (!fields) {
      return originalJson(data);
    }

    // If data structure doesn't have a 'data' property, return as is
    if (!data || typeof data !== 'object' || !data.data) {
      return originalJson(data);
    }
    
    // Parse requested fields
    const selectedFields = fields.split(',').map(f => f.trim());
    
    // Filter function for objects
    const filterFields = (obj) => {
      if (Array.isArray(obj)) {
        return obj.map(filterFields);
      }
      
      if (obj && typeof obj === 'object') {
        const filtered = {};
        selectedFields.forEach(field => {
          if (obj.hasOwnProperty(field)) {
            filtered[field] = obj[field];
          }
        });
        return filtered;
      }
      
      return obj;
    };
    
    // Apply filtering
    if (Array.isArray(data.data)) {
      data.data = data.data.map(filterFields);
    } else {
      data.data = filterFields(data.data);
    }
    
    return originalJson(data);
  };
  
  next();
}

export default fieldSelection;
