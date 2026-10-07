/**
 * CivicPulse Frontend API Client
 * Centralized fetch wrapper with automatic JWT authorization header injection.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  static getToken() {
    return localStorage.getItem('civicpulse_token') || null;
  }

  static setToken(token) {
    if (token) {
      localStorage.setItem('civicpulse_token', token);
    } else {
      localStorage.removeItem('civicpulse_token');
    }
  }

  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      ...(options.headers || {}),
    };

    // Attach Bearer token if present
    const token = ApiClient.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Default to JSON content type unless sending FormData
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = { success: false, message: response.statusText };
    }

    if (!response.ok) {
      const errorMsg =
        data.message ||
        (data.details && data.details[0]?.message) ||
        `Request failed with status ${response.status}`;
      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = data;
      throw err;
    }

    return data;
  }

  // Auth endpoints
  static async register(userData) {
    const res = await ApiClient.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (res.data?.token) {
      ApiClient.setToken(res.data.token);
    }
    return res.data;
  }

  static async login(credentials) {
    const res = await ApiClient.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.data?.token) {
      ApiClient.setToken(res.data.token);
    }
    return res.data;
  }

  static async getMe() {
    const res = await ApiClient.request('/auth/me');
    return res.data?.user || res.data;
  }

  static logout() {
    ApiClient.setToken(null);
    localStorage.removeItem('civicpulse_user');
  }

  // Profile endpoints
  static async updateProfile(profileData) {
    const res = await ApiClient.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return res.data;
  }
}

export default ApiClient;
