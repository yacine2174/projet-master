import { currentConfig, API_ENDPOINTS } from '../config/config';

// ===== Types =====
export interface User {
  _id: string;
  nom: string;
  email: string;
  role: 'ADMIN' | 'RSSI' | 'SSI';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface SignupData {
  nom: string;
  email: string;
  motDePasse: string;
  role?: 'ADMIN' | 'RSSI' | 'SSI';
}

export interface PasswordResetRequest {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: 'ADMIN' | 'RSSI' | 'SSI';
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: string;
  approvedAt?: string;
  adminNotes?: string;
}

// ===== HTTP helpers =====
const API_BASE = currentConfig.apiBaseUrl;

const buildHeaders = (): HeadersInit => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Centralized response handler with 401 broadcast
async function handleResponse(res: Response) {
  const text = await res.text();
  let data;
  
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    const error = new Error('Invalid server response');
    (error as any).response = { status: res.status, data: { message: 'Invalid server response' } };
    throw error;
  }

  // Handle 401 Unauthorized
  if (res.status === 401) {
    try {
      window.dispatchEvent(new Event('unauthorized'));
    } catch {}
    
    const error = new Error(data?.message || 'Session expired');
    (error as any).response = { status: res.status, data };
    throw error;
  }

  // Handle 500 Internal Server Error
  if (res.status >= 500) {
    const error = new Error(data?.message || 'Internal server error');
    (error as any).response = { status: res.status, data };
    throw error;
  }

  // Handle other error statuses
  if (!res.ok) {
    const error = new Error(data?.message || `Request failed with status ${res.status}`);
    (error as any).response = { status: res.status, data };
    throw error;
  }

  return data;
}

// ===== Audit + related domain API =====
export const auditAPI = {
  // Audits
  async getAudits() {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.GET_AUDITS}`, {
      credentials: 'include',
      headers: buildHeaders(),
    });
    return handleResponse(res);
  },
  async getAllAudits() {
    return this.getAudits();
  },
  async getAudit(id: string) {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.GET_AUDIT}/${id}` ,{
      credentials: 'include',
      headers: buildHeaders(),
    });
    return handleResponse(res);
  },
  async createAudit(payload: any) {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.CREATE_AUDIT}`, {
      method: 'POST',
      credentials: 'include',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  async updateAudit(id: string, payload: any) {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.UPDATE_AUDIT}/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  async updateAuditStatus(id: string, statut: string) {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.UPDATE_AUDIT}/${id}/statut`, {
      method: 'PUT',
      credentials: 'include',
      headers: buildHeaders(),
      body: JSON.stringify({ statut }),
    });
    return handleResponse(res);
  },

  // Constats
  async getConstats(auditId: string) {
    const url = `${API_BASE}${API_ENDPOINTS.GET_CONSTATS}?audit=${encodeURIComponent(auditId)}`;
    const res = await fetch(url, { credentials: 'include', headers: buildHeaders() });
    return handleResponse(res);
  },
  async createConstat(payload: any) {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.CREATE_CONSTAT}`, {
      method: 'POST',
      credentials: 'include',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  async deleteConstat(id: string) {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.DELETE_CONSTAT}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: buildHeaders(),
    });
    return handleResponse(res);
  },

  // Plan d'action
  async getPlanActions(auditId: string) {
    const url = `${API_BASE}${API_ENDPOINTS.GET_PLAN_ACTIONS}?audit=${encodeURIComponent(auditId)}`;
    const res = await fetch(url, { credentials: 'include', headers: buildHeaders() });
    return handleResponse(res);
  },
  async createPlanAction(payload: any) {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.CREATE_PLAN_ACTION}`, {
      method: 'POST',
      credentials: 'include',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  async deletePlanAction(id: string) {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.DELETE_PLAN_ACTION}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: buildHeaders(),
    });
    return handleResponse(res);
  },
};

// ===== Normes API (minimal) =====
export const normesAPI = {
  async getNormes() {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.GET_NORMES}`, {
      credentials: 'include',
      headers: buildHeaders(),
    });
    return handleResponse(res);
  },
};

// ===== Projet API (minimal) =====
export const projetAPI = {
  async getAllProjets() {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.GET_PROJECTS}`, {
      credentials: 'include',
      headers: buildHeaders(),
    });
    return handleResponse(res);
  },
};

// ===== Constat API (minimal) =====
export const constatAPI = {
  async getAllConstats() {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.GET_CONSTATS}`, {
      credentials: 'include',
      headers: buildHeaders(),
    });
    return handleResponse(res);
  },
};

// ===== Recommandation API (minimal) =====
export const recommandationAPI = {
  async getAllRecommandations() {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.GET_RECOMMENDATIONS}`, {
      credentials: 'include',
      headers: buildHeaders(),
    });
    return handleResponse(res);
  },
};

// ===== Plan d'Action API (minimal) =====
export const planActionAPI = {
  async getAllPlanActions() {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.GET_PLAN_ACTIONS}`, {
      credentials: 'include',
      headers: buildHeaders(),
    });
    return handleResponse(res);
  },
};

// ===== Auth API =====
export const authAPI = {
  async login(payload: { email: string; motDePasse: string }) {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.LOGIN}`, {
      method: 'POST',
      credentials: 'include',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  async signup(payload: SignupData) {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.SIGNUP}`, {
      method: 'POST',
      credentials: 'include',
      headers: buildHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  async forgotPassword(email: string) {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.FORGOT_PASSWORD}`, {
      method: 'POST',
      credentials: 'include',
      headers: buildHeaders(),
      body: JSON.stringify({ email }),
    });
    return handleResponse(res);
  },
  async resetPassword(email: string, newPassword: string) {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.RESET_PASSWORD}`, {
      method: 'POST',
      credentials: 'include',
      headers: buildHeaders(),
      body: JSON.stringify({ email, newPassword }),
    });
    return handleResponse(res);
  },
  async checkPasswordResetStatus(email: string) {
    const url = `${API_BASE}${API_ENDPOINTS.GET_PASSWORD_RESET_REQUESTS}?email=${encodeURIComponent(email)}`;
    const res = await fetch(url, { credentials: 'include', headers: buildHeaders() });
    return handleResponse(res);
  },
};

// ===== Users API (Admin) =====
export const userAPI = {
  async getAllUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.GET_USERS}`, {
      credentials: 'include',
      headers: buildHeaders(),
    });
    return handleResponse(res);
  },
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.UPDATE_USER}/${userId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: buildHeaders(),
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },
  async approveUser(userId: string): Promise<User> {
    try {
      console.log('Attempting to approve user:', userId);
      console.log('API Base URL:', API_BASE);
      
      const url = `${API_BASE}/utilisateurs/${userId}/approve`;
      console.log('Request URL:', url);
      
      const headers = buildHeaders();
      console.log('Request headers:', headers);
      
      const res = await fetch(url, {
        method: 'PATCH',
        headers: headers,
        credentials: 'include',
      });
      
      console.log('Response status:', res.status);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Approval failed with status:', res.status);
        console.error('Error response:', errorText);
        throw new Error(errorText || 'Failed to approve user');
      }
      
      const data = await res.json();
      console.log('Approval successful:', data);
      return data;
    } catch (error) {
      console.error('Error in approveUser:', error);
      throw error;
    }
  },

  async rejectUser(userId: string): Promise<User> {
    try {
      console.log('Attempting to reject user:', userId);
      const url = `${API_BASE}/utilisateurs/${userId}/reject`;
      const headers = buildHeaders();
      
      const res = await fetch(url, {
        method: 'PATCH',
        headers: headers,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Rejection failed with status:', res.status);
        console.error('Error response:', errorText);
        throw new Error(errorText || 'Failed to reject user');
      }
      
      return await res.json();
    } catch (error) {
      console.error('Error in rejectUser:', error);
      throw error;
    }
  },
  async deleteUser(userId: string) {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.DELETE_USER}/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: buildHeaders(),
    });
    return handleResponse(res);
  },
};

// ===== Password Reset Requests (Admin) =====
export const passwordResetAPI = {
  async getPasswordResetRequests(): Promise<PasswordResetRequest[]> {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.GET_PASSWORD_RESET_REQUESTS}`, {
      credentials: 'include',
      headers: buildHeaders(),
    });
    return handleResponse(res);
  },
  async approvePasswordReset(requestId: string, notes?: string) {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.APPROVE_PASSWORD_RESET}/${requestId}`, {
      method: 'POST',
      credentials: 'include',
      headers: buildHeaders(),
      body: JSON.stringify({ notes }),
    });
    return handleResponse(res);
  },
  async rejectPasswordReset(requestId: string, notes?: string) {
    const res = await fetch(`${API_BASE}${API_ENDPOINTS.REJECT_PASSWORD_RESET}/${requestId}`, {
      method: 'POST',
      credentials: 'include',
      headers: buildHeaders(),
      body: JSON.stringify({ notes }),
    });
    return handleResponse(res);
  },
};

