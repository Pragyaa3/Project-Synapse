// lib/storage.js

const STORAGE_KEY = 'synapse_items';

export const storage = {
  getAll: () => {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Failed to load items:', error);
      return [];
    }
  },

  getById: (id) => {
    const items = storage.getAll();
    return items.find(item => item.id === id) || null;
  },

  save: (item) => {
    try {
      const items = storage.getAll();
      items.unshift(item);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save item:', error);
      throw error;
    }
  },

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

  delete: (id) => {
    try {
      const items = storage.getAll();
      const filtered = items.filter(item => item.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete item:', error);
      throw error;
    }
  },

  clear: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  },

  filterByType: (type) => {
    const items = storage.getAll();
    return items.filter(item => item.type === type);
  },

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