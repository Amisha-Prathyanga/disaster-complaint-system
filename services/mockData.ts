import { Complaint, ComplaintCategory, ComplaintStatus, Priority, User, UserRole } from '../types';

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-2023-001',
    title: 'Bridge Collapse on Main St',
    description: 'The small bridge connecting the village to the main road has collapsed due to heavy rain. Access is completely cut off.',
    category: ComplaintCategory.INFRASTRUCTURE,
    location: 'Gampaha - Division A',
    latitude: 7.0917,
    longitude: 80.0152,
    dsd: 'Gampaha',
    status: ComplaintStatus.NEW,
    priority: Priority.CRITICAL,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    contactName: 'Saman Perera',
    contactPhone: '0771234567'
  },
  {
    id: 'CMP-2023-002',
    title: 'Flood water entering houses',
    description: 'Water levels are rising rapidly in the low-lying areas of Zone 4. Need immediate evacuation assistance.',
    category: ComplaintCategory.SAFETY,
    location: 'Colombo - Zone 4',
    latitude: 6.9271,
    longitude: 79.8612,
    dsd: 'Colombo',
    status: ComplaintStatus.IN_PROGRESS,
    priority: Priority.HIGH,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), // 5 hours ago
    contactName: 'Nimali Silva',
    contactPhone: '0719876543',
    remarks: ['Officer dispatched at 14:00', 'Evacuation team requested']
  },
  {
    id: 'CMP-2023-003',
    title: 'Power outage for 48 hours',
    description: 'No electricity in the entire neighborhood since the storm started. Food in fridges is spoiling.',
    category: ComplaintCategory.OTHER,
    location: 'Kandy - Hill Side',
    latitude: 7.2906,
    longitude: 80.6337,
    dsd: 'Kandy',
    status: ComplaintStatus.NEW,
    priority: Priority.MEDIUM,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    contactName: 'John Doe',
    contactPhone: '0765554444'
  },
  {
    id: 'CMP-2023-004',
    title: 'Shortage of drinking water',
    description: 'The local relief center has run out of clean drinking water bottles.',
    category: ComplaintCategory.SUPPLIES,
    location: 'Galle - Relief Camp 1',
    latitude: 6.0535,
    longitude: 80.2210,
    dsd: 'Galle',
    status: ComplaintStatus.RESOLVED,
    priority: Priority.HIGH,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    remarks: ['Water truck delivered at 10:00 AM']
  },
  {
    id: 'CMP-2023-005',
    title: 'Landslide warning signs',
    description: 'Cracks appearing on the retaining wall near the school.',
    category: ComplaintCategory.SAFETY,
    location: 'Badulla - School Ln',
    latitude: 6.9934,
    longitude: 81.0550,
    dsd: 'Badulla',
    status: ComplaintStatus.NEW,
    priority: Priority.CRITICAL,
    createdAt: new Date().toISOString(),
    contactName: 'Principal Kamal',
    contactPhone: '0701112222'
  }
];

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Admin User', role: UserRole.ADMIN },
  { id: 'u2', name: 'Officer Gampaha', role: UserRole.OFFICER, dsd: 'Gampaha' },
  { id: 'u3', name: 'Officer Colombo', role: UserRole.OFFICER, dsd: 'Colombo' },
];