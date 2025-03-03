// API utilities for connecting to the backend

// URL of the backend API - change this to your deployment URL when deploying to production
const API_URL = "http://localhost:5000/api";  // Backend is running on port 5000

/**
 * Makes an authenticated API request
 * @param endpoint - API endpoint (without base URL)
 * @param options - Fetch options
 * @returns Promise with response data
 */
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  // Get token from local storage
  const token = localStorage.getItem("habitjoy-token");
  
  // Set default headers
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  
  // Make the request
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  // Parse the response
  const data = await response.json();
  
  // Handle errors
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  
  return data;
};

// Products API
export const productsApi = {
  getAll: () => apiRequest("/products"),
  getById: (id: string) => apiRequest(`/products/${id}`),
};

// Payment API
export const paymentApi = {
  createOrder: (orderData: any) => 
    apiRequest("/payment/create-order", {
      method: "POST",
      body: JSON.stringify(orderData),
    }),
  
  verifyPayment: (paymentData: any) =>
    apiRequest("/payment/verify-payment", {
      method: "POST",
      body: JSON.stringify(paymentData),
    }),
  
  createSubscription: (subscriptionData: any) =>
    apiRequest("/payment/create-subscription", {
      method: "POST",
      body: JSON.stringify(subscriptionData),
    }),
  
  cancelSubscription: (subscriptionId: string) =>
    apiRequest(`/payment/cancel-subscription/${subscriptionId}`, {
      method: "DELETE",
    }),
};

// Orders API
export const ordersApi = {
  getMyOrders: () => apiRequest("/orders/my-orders"),
  getById: (id: string) => apiRequest(`/orders/${id}`),
};

// User API
export const userApi = {
  getProfile: () => apiRequest("/auth/me"),
  updateProfile: (userData: any) =>
    apiRequest("/auth/update-me", {
      method: "PATCH",
      body: JSON.stringify(userData),
    }),
  updatePassword: (passwordData: any) =>
    apiRequest("/auth/update-password", {
      method: "PATCH",
      body: JSON.stringify(passwordData),
    }),
};