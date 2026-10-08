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

  // Complaint endpoints
  static async createComplaint(complaintData) {
    const isFormData = complaintData instanceof FormData;
    const res = await ApiClient.request('/complaints', {
      method: 'POST',
      body: isFormData ? complaintData : JSON.stringify(complaintData),
    });
    return res.data?.complaint || res.data;
  }

  static async getComplaints(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    const endpoint = `/complaints${qs ? `?${qs}` : ''}`;
    const res = await ApiClient.request(endpoint);
    const complaints = Array.isArray(res.data) ? res.data : (res.data?.complaints || []);
    complaints.pagination = res.pagination || {
      page: Number(params.page) || 1,
      limit: Number(params.limit) || complaints.length,
      total: complaints.length,
      pages: 1,
      totalPages: 1,
      hasNext: false,
      hasNextPage: false,
      hasPrev: false,
      hasPrevPage: false,
    };
    complaints.complaints = complaints;
    return complaints;
  }

  static async getComplaintById(id) {
    const res = await ApiClient.request(`/complaints/${id}`);
    return res.data?.complaint || res.data;
  }

  static async updateComplaint(id, updates) {
    const res = await ApiClient.request(`/complaints/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    return res.data?.complaint || res.data;
  }

  static async voteComplaint(complaintId, voteType) {
    const res = await ApiClient.request(`/complaints/${complaintId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote_type: voteType }),
    });
    return res.data;
  }

  // Upload endpoints
  static async uploadComplaintImage(file, complaintId = null) {
    const formData = new FormData();
    formData.append('image', file);
    if (complaintId) {
      formData.append('complaint_id', complaintId);
    }

    const res = await ApiClient.request('/uploads/complaint-image', {
      method: 'POST',
      body: formData,
    });
    return res.data?.image || res.data;
  }

  // Comment endpoints
  static async getComments(complaintId) {
    const res = await ApiClient.request(`/comments/complaint/${complaintId}`);
    return Array.isArray(res.data) ? res.data : (res.data?.comments || []);
  }

  static async addComment(complaintId, content, isAnonymous = false) {
    const res = await ApiClient.request(`/comments/complaint/${complaintId}`, {
      method: 'POST',
      body: JSON.stringify({ content, is_anonymous: isAnonymous }),
    });
    return res.data;
  }

  static async deleteComment(commentId) {
    const res = await ApiClient.request(`/comments/${commentId}`, {
      method: 'DELETE',
    });
    return res.data;
  }

  // Status history
  static async getStatusHistory(complaintId) {
    const res = await ApiClient.request(`/complaints/${complaintId}/status-history`);
    return Array.isArray(res.data) ? res.data : (res.data?.history || []);
  }

  // My complaints (current authenticated user)
  static async getMyComplaints(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    const endpoint = `/complaints/mine${qs ? `?${qs}` : ''}`;
    const res = await ApiClient.request(endpoint);
    const complaints = Array.isArray(res.data) ? res.data : (res.data?.complaints || []);
    complaints.pagination = res.pagination || { page: 1, total: complaints.length, totalPages: 1 };
    return complaints;
  }

  // Resolution verification endpoints
  static async getVerificationStatus(complaintId) {
    const res = await ApiClient.request(`/complaints/${complaintId}/verification`);
    return res.data;
  }

  static async submitVerification(complaintId, result, remarks = null) {
    const res = await ApiClient.request(`/complaints/${complaintId}/verification`, {
      method: 'POST',
      body: JSON.stringify({ result, remarks }),
    });
    return res.data;
  }

  static async withdrawVerification(complaintId) {
    const res = await ApiClient.request(`/complaints/${complaintId}/verification`, {
      method: 'DELETE',
    });
    return res.data;
  }

  // AI endpoints
  static async classifyComplaint(data) {
    const res = await ApiClient.request('/ai/classify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  }

  // Admin / Municipal Command Center endpoints
  static async getAdminDashboard(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    const res = await ApiClient.request(`/admin/dashboard${qs ? `?${qs}` : ''}`);
    return res.data;
  }

  static async getAdminComplaints(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    const res = await ApiClient.request(`/admin/complaints${qs ? `?${qs}` : ''}`);
    const complaints = Array.isArray(res.data) ? res.data : (res.data?.complaints || []);
    complaints.pagination = res.pagination || { page: 1, total: complaints.length, totalPages: 1 };
    return complaints;
  }

  static async getAdminComplaint(id) {
    const res = await ApiClient.request(`/admin/complaints/${id}`);
    return res.data;
  }

  static async updateAdminComplaintStatus(id, { status, notes, assigned_department }) {
    const res = await ApiClient.request(`/admin/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes, assigned_department }),
    });
    return res.data;
  }

  static async getAdminAnalytics(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const qs = query.toString();
    const res = await ApiClient.request(`/admin/analytics${qs ? `?${qs}` : ''}`);
    return res.data;
  }
}

export default ApiClient;
