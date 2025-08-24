/**
 * Centralized API service for restaurant data entry app
 * All API calls go through this service - change URL once, updates everywhere!
 */

// Your existing backend base URL - change this ONE place to update everywhere
const BASE_URL = 'https://us-central1-mongoose1-app.cloudfunctions.net';

// API endpoints
const ENDPOINTS = {
  RESTAURANTS: '/api/restaurants/holding',
};

/**
 * Generic fetch wrapper with error handling
 */
async function apiCall(endpoint, options = {}) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`🌐 API Call: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ API Success: ${options.method || 'GET'} ${endpoint}`, data);
    return data;
  } catch (error) {
    console.error(`❌ API Error: ${options.method || 'GET'} ${endpoint}`, error);
    throw error;
  }
}

/**
 * Restaurant API functions
 */
export const restaurantAPI = {
  /**
   * Create a new restaurant
   * @param {Object} restaurantData - Restaurant data to save
   * @returns {Promise<Object>} API response
   */
  async create(restaurantData) {
    return apiCall(ENDPOINTS.RESTAURANTS, {
      method: 'POST',
      body: JSON.stringify(restaurantData),
    });
  },

  /**
   * Get all restaurants with optional sorting
   * @param {Object} params - Query parameters
   * @param {string} params.sort_by - Field to sort by (created_at, restaurant_name)
   * @param {string} params.order - Sort order (asc, desc)
   * @returns {Promise<Object>} API response with restaurants array
   */
  async getAll(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `${ENDPOINTS.RESTAURANTS}?${queryString}` : ENDPOINTS.RESTAURANTS;
    return apiCall(endpoint);
  },

  /**
   * Get restaurant by ID (for future use)
   * @param {string} id - Restaurant ID
   * @returns {Promise<Object>} Restaurant data
   */
  async getById(id) {
    return apiCall(`${ENDPOINTS.RESTAURANTS}/${id}`);
  },

  /**
   * Update restaurant (for future use)
   * @param {string} id - Restaurant ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated restaurant
   */
  async update(id, updateData) {
    return apiCall(`${ENDPOINTS.RESTAURANTS}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  },

  /**
   * Delete restaurant (for future use when you add this to backend)
   * @param {string} id - Restaurant ID
   * @returns {Promise<Object>} API response
   */
  async delete(id) {
    return apiCall(`${ENDPOINTS.RESTAURANTS}/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Admin API functions (for future use)
 */
export const adminAPI = {
  /**
   * Get admin stats and restaurant data
   * @returns {Promise<Object>} Admin data with stats
   */
  async getStats() {
    // For now, just use the same endpoint
    // You can add admin-specific endpoints to your backend later
    return restaurantAPI.getAll();
  },
};

/**
 * Configuration utilities
 */
export const apiConfig = {
  /**
   * Get current base URL
   * @returns {string} Base URL
   */
  getBaseUrl() {
    return BASE_URL;
  },

  /**
   * Update base URL (for testing different environments)
   * @param {string} newUrl - New base URL
   */
  setBaseUrl(newUrl) {
    BASE_URL = newUrl;
    console.log(`🔧 API Base URL updated to: ${BASE_URL}`);
  },
};

export default restaurantAPI;