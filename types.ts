export enum UserRole {
  CITIZEN = 'CITIZEN',
  OFFICER = 'OFFICER',
  ADMIN = 'ADMIN'
}

export enum ComplaintCategory {
  SAFETY = 'Safety & Security',
  INFRASTRUCTURE = 'Infrastructure Damage',
  MEDICAL = 'Medical Emergency',
  SUPPLIES = 'Food & Supplies',
  OTHER = 'General/Other'
}

export enum ComplaintStatus {
  NEW = 'New',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  REJECTED = 'Rejected'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  dsd?: string; // Divisional Secretariat Division assigned to officer
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  latitude?: number;
  longitude?: number;
  dsd: string; // Auto-routed based on location logic (mocked)
  status: ComplaintStatus;
  priority: Priority;
  createdAt: string;
  contactName?: string;
  contactPhone?: string;
  remarks?: string[];
  aiAnalysis?: string; // Stored result from Gemini
}

export interface DashboardStats {
  total: number;
  new: number;
  inProgress: number;
  resolved: number;
  byCategory: { name: string; value: number }[];
}