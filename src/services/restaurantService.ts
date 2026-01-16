import api from '@/config/api';
import { Restaurant } from '@/types';

export const restaurantService = {
  async getAllRestaurants(): Promise<Restaurant[]> {
    const response = await api.get('/restaurants');
    return response.data;
  },

  async getRestaurantById(id: number): Promise<Restaurant> {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },

  async getRestaurantByOwnerId(ownerId: number): Promise<Restaurant> {
    const response = await api.get(`/restaurants/owner/${ownerId}`);
    return response.data;
  },

  async createRestaurant(restaurantData: Partial<Restaurant>, ownerId: number): Promise<Restaurant> {
    const response = await api.post(`/restaurants?ownerId=${ownerId}`, restaurantData);
    return response.data;
  },

  async updateRestaurant(id: number, restaurantData: Partial<Restaurant>): Promise<Restaurant> {
    const response = await api.put(`/restaurants/${id}`, restaurantData);
    return response.data;
  },

  async deleteRestaurant(id: number): Promise<void> {
    await api.delete(`/restaurants/${id}`);
  },

  async searchRestaurants(query: string): Promise<Restaurant[]> {
    const response = await api.get(`/restaurants/search?q=${query}`);
    return response.data;
  },

  async getRestaurantsByCategory(category: string): Promise<Restaurant[]> {
    const response = await api.get(`/restaurants/category/${category}`);
    return response.data;
  },
};
