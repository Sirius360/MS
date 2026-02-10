// ===== server/utils/pagination.js =====
// Pagination helper utilities

export class PaginationHelper {
  /**
   * Paginate array of data
   * @param {Array} data - Data array to paginate
   * @param {number} page - Page number (1-indexed)
   * @param {number} limit - Items per page
   * @returns {Object} Paginated result with data and metadata
   */
  static paginate(data, page = 1, limit = 50) {
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50)); // Max 100 items per page
    
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedData = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / limitNum);
    
    return {
      data: paginatedData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: data.length,
        totalPages,
        hasNext: endIndex < data.length,
        hasPrev: pageNum > 1,
      },
    };
  }

  /**
   * Build pagination links for REST API
   * @param {Object} req - Express request object
   * @param {Object} pagination - Pagination metadata
   * @returns {Object} Navigation links
   */
  static buildLinks(req, pagination) {
    const baseUrl = `${req.protocol}://${req.get('host')}${req.path}`;
    const query = new URLSearchParams(req.query);
    
    const links = {};
    
    // Next page
    if (pagination.hasNext) {
      query.set('page', String(pagination.page + 1));
      links.next = `${baseUrl}?${query.toString()}`;
    }
    
    // Previous page
    if (pagination.hasPrev) {
      query.set('page', String(pagination.page - 1));
      links.prev = `${baseUrl}?${query.toString()}`;
    }
    
    // First page
    query.set('page', '1');
    links.first = `${baseUrl}?${query.toString()}`;
    
    // Last page
    query.set('page', String(pagination.totalPages));
    links.last = `${baseUrl}?${query.toString()}`;
    
    return links;
  }

  /**
   * Parse pagination parameters from request
   * @param {Object} req - Express request object
   * @param {Object} defaults - Default values
   * @returns {Object} Parsed pagination params
   */
  static parseParams(req, defaults = { page: 1, limit: 50 }) {
    const page = parseInt(req.query.page) || defaults.page;
    const limit = parseInt(req.query.limit) || defaults.limit;
    
    return {
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)),
    };
  }
}

export default PaginationHelper;
