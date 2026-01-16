import api from '@/config/api';
import { MenuItem } from '@/types';

export const menuItemService = {
  async getMenuItemsByRestaurant(restaurantId: number): Promise<MenuItem[]> {
    const response = await api.get(`/menu-items/restaurant/${restaurantId}`);
    return response.data;
  },

  async getMenuItemById(id: number): Promise<MenuItem> {
    const response = await api.get(`/menu-items/${id}`);
    return response.data;
  },

  async createMenuItem(menuItemData: Partial<MenuItem>): Promise<MenuItem> {
    const response = await api.post('/menu-items', menuItemData);
    return response.data;
  },

  async updateMenuItem(id: number, menuItemData: Partial<MenuItem>): Promise<MenuItem> {
    const response = await api.put(`/menu-items/${id}`, menuItemData);
    return response.data;
  },

  async deleteMenuItem(id: number): Promise<void> {
    await api.delete(`/menu-items/${id}`);
  },
};
