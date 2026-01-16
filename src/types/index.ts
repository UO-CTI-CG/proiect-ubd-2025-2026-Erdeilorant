export interface Restaurant {
  id: number;
  name: string;
  image: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  deliveryFee: number;
  minOrder: number;
  isOpen: boolean;
  address: string;
  categories: string[];
  ownerId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface MenuItem {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isPopular?: boolean;
  isVegetarian?: boolean;
  available?: boolean;
  allergens?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface OrderItem {
  id: number;
  menuItemId: number;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
  category?: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  restaurantId: number;
  restaurantName: string;
  items: OrderItem[];
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt?: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  notes?: string;
}
