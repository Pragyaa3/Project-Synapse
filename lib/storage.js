// lib/storage.js
// Updated to use API instead of localStorage (with localStorage as cache)

const STORAGE_KEY = 'synapse_items';

export const storage = {
  // Get all items from localStorage cache
  getAll: () => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load items from cache:', error);
      return [];
    }
  },

  // Fetch all items from API and update cache
  fetchAll: async () => {
    try {
      const response = await fetch('/api/save');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API error details:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to fetch items');
      }
      const { items } = await response.json();

      // Update localStorage cache
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }

      return items;
    } catch (error) {
      console.error('Failed to fetch items from API:', error);
      console.error('Error details:', error.message);
      // Fallback to cache
      const cachedItems = storage.getAll();
      console.log(`Using ${cachedItems.length} cached items as fallback`);
      return cachedItems;
    }
  },

  // Get item by ID
  getById: (id) => {
    const items = storage.getAll();
    return items.find(item => item.id === id) || null;
  },

  // Save item to cache (should be called after API save)
  save: (item) => {
    try {
      const items = storage.getAll();
      // Check if item already exists
      const existingIndex = items.findIndex(i => i.id === item.id);
      if (existingIndex >= 0) {
        // Update existing
        items[existingIndex] = item;
      } else {
        // Add new
        items.unshift(item);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save item to cache:', error);
      throw error;
    }
  },

  // Update item (not used anymore, but keeping for backward compatibility)
  update: (id, updates) => {
    try {
      const items = storage.getAll();
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items[index] = {
          ...items[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      }
    } catch (error) {
      console.error('Failed to update item:', error);
      throw error;
    }
  },

  // Delete item from API and cache
  delete: async (id) => {
    try {
      // Delete from API
      const response = await fetch(`/api/save?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete from API');
      }

      // Update cache
      const items = storage.getAll();
      const filtered = items.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

      return true;
    } catch (error) {
      console.error('Failed to delete item:', error);
      throw error;
    }
  },

  // Clear all items
  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  },

  // Filter items by type (from cache)
  filterByType: (type) => {
    const items = storage.getAll();
    return items.filter(item => item.type === type);
  },

  // Get statistics
  getStats: () => {
    const items = storage.getAll();
    const typeCount = {};

    items.forEach(item => {
      typeCount[item.type] = (typeCount[item.type] || 0) + 1;
    });

    return {
      total: items.length,
      byType: typeCount,
      latestDate: items[0]?.createdAt,
      oldestDate: items[items.length - 1]?.createdAt
    };
  }
};
