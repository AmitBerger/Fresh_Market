import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
});

// Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// === Interfaces ===

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  stockQuantity: number;
}

export interface CartItem {
  id: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  id: number;
  items: CartItem[];
}

export interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: {
      id: number;
      quantity: number;
      priceAtPurchase: number;
      product: Product;
  }[];
}

// ממשק למשתמש (פרופיל)
export interface UserProfile {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

// === API Functions ===

export const registerUser = async (userData: RegisterData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

export const loginUser = async (userData: LoginData) => {
  const response = await api.post('/auth/login', userData);
  return response.data;
};

export const getProducts = async () => {
  const response = await api.get<Product[]>('/products');
  return response.data;
};

export const addToCart = async (productId: number, quantity: number = 1) => {
  const response = await api.post('/cart/add', { productId, quantity });
  return response.data;
};

export const getCart = async () => {
  const response = await api.get<Cart>('/cart');
  return response.data;
};

export const updateCartItem = async (itemId: number, quantity: number) => {
  const response = await api.patch(`/cart/${itemId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (itemId: number) => {
  const response = await api.delete(`/cart/${itemId}`);
  return response.data;
};

export const checkout = async () => {
  const response = await api.post('/orders');
  return response.data;
};

export const getMyOrders = async () => {
  const response = await api.get<Order[]>('/orders');
  return response.data;
};

// --- פונקציות פרופיל חדשות ---
export const getUserProfile = async () => {
  const response = await api.get<UserProfile>('/users/profile');
  return response.data;
};

export const updateUserProfile = async (data: { firstName: string; lastName: string }) => {
  const response = await api.patch<UserProfile>('/users/profile', data);
  return response.data;
};

export const changeUserPassword = async (password: string) => {
  const response = await api.patch('/users/profile/password', { password });
  return response.data;
};

export default api;