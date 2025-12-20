import { Complaint, User, UserRole, ComplaintStatus, Priority } from '../types';

const API_BASE_URL = 'http://127.0.0.1:5000/api';

export const api = {
  // Login
  login: async (username: string, password: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (data.success) {
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  },

  // Fetch Complaints
  getComplaints: async (user: User): Promise<Complaint[]> => {
    try {
      let url = `${API_BASE_URL}/complaints`;
      if (user.role === UserRole.OFFICER) {
        url += `?role=OFFICER&dsd=${encodeURIComponent(user.dsd || '')}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Fetch complaints error:', error);
      return [];
    }
  },

  // Create Complaint
  createComplaint: async (complaint: Partial<Complaint>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaint)
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Create complaint error:', error);
      return false;
    }
  },

  // Update Complaint
  updateComplaint: async (id: string, updates: Partial<Complaint>): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Update complaint error:', error);
      return false;
    }
  },

  // Public Tracking
  getPublicStatus: async (id: string): Promise<any> => {
    try {
      const response = await fetch(`${API_BASE_URL}/public/complaints/${id}`);
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      return null;
    } catch (error) {
      console.error('Tracking error:', error);
      return null;
    }
  }
};
