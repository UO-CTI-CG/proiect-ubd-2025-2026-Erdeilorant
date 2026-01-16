import api from '@/config/api';
import { Order } from '@/types';

export interface CreateOrderRequest {
  restaurantId: number;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes?: string;
  items: {
    menuItemId: number;
    quantity: number;
  }[];
}

export const orderService = {
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  async getOrderById(id: number): Promise<Order> {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  async getOrderByOrderNumber(orderNumber: string): Promise<Order> {
    const response = await api.get(`/orders/number/${orderNumber}`);
    return response.data;
  },

  async getOrdersByRestaurant(restaurantId: number): Promise<Order[]> {
    const response = await api.get(`/orders/restaurant/${restaurantId}`);
    return response.data;
  },

  async getOrdersByStatus(status: string): Promise<Order[]> {
    const response = await api.get(`/orders/status/${status}`);
    return response.data;
  },

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const response = await api.patch(`/orders/${id}/status`, { status });
    return response.data;
  },

  async deleteOrder(id: number): Promise<void> {
    await api.delete(`/orders/${id}`);
  },
};
