import {
  User,
  Quotation,
  Payment,
  Booking,
  Project,
  Staff
} from './types';

export const mockUsers: User[] = [
  { id: '1', username: 'admin', role: 'admin', name: 'arjun' },
];

export const mockQuotations: Quotation[] = [
  {
    id: 'Q-1001',
    customerName: 'Rahul Sharma',
    phone: '9876543210',
    email: 'rahul@example.com',
    location: 'Bhubaneswar, Odisha',
    bookingDate: '2026-08-15',
    eventType: 'Wedding',
    services: [
      { id: 's1', name: 'Candid Photography', quantity: 1, price: 25000 },
      { id: 's2', name: 'Cinematic Videography', quantity: 1, price: 35000 },
    ],
    discount: 5000,
    subTotal: 60000,
    grandTotal: 55000,
    paymentTerms: '50% Advance, 50% on Delivery',
    termsConditions: 'Standard terms apply.',
    createdAt: '2026-07-10T10:00:00Z',
    updatedAt: '2026-07-10T10:00:00Z',
  }
];

export const mockPayments: Payment[] = [
  {
    id: 'P-2001',
    customerId: 'C-001',
    customerName: 'Rahul Sharma',
    phone: '9876543210',
    quotationId: 'Q-1001',
    amount: 32450,
    paymentMethod: 'UPI QR',
    screenshotUrl: 'https://via.placeholder.com/150',
    status: 'Verified',
    date: new Date().toISOString(),
  }
];

export const mockBookings: Booking[] = [
  {
    id: 'B-3001',
    client: 'Rahul Sharma',
    date: '2026-08-15',
    venue: 'Mayfair Lagoon, BBSR',
    photographers: ['PH-1'],
    videographers: ['VD-1'],
    package: 'Premium Wedding',
    advancePaid: 32450,
    pending: 32450,
    status: 'Upcoming',
    createdAt: '2026-07-13T09:00:00Z',
  }
];

export const mockProjects: Project[] = [
  {
    id: 'P-001',
    projectNumber: 'PRJ-XYZ123',
    name: 'Rahul Sharma',
    phone: '9876543210',
    email: 'rahul@example.com',
    location: 'Bhubaneswar',
    eventType: 'Wedding',
    status: 'Qualified',
    notes: 'Interested in premium package.',
    totalValue: 50000,
    payments: ['P-2001'],
    crewBlueprint: [],
    expenses: [
      { date: new Date().toISOString(), description: 'Advance for photographer', amount: 5000 }
    ],
    createdAt: '2026-07-01T10:00:00Z',
  }
];

export const mockStaff: Staff[] = [
  {
    id: 'PH-1',
    name: 'Amit Kumar',
    phone: '9123456780',
    role: 'Lead Photographer',
    location: 'Cuttack',
    address: 'Cuttack Main Street',
    charges: 5000,
    createdAt: new Date().toISOString()
  },
  {
    id: 'VD-1',
    name: 'Suman Dash',
    phone: '9988776655',
    role: 'Cinematographer',
    location: 'Bhubaneswar',
    address: 'Bhubaneswar Central Lane',
    charges: 7000,
    createdAt: new Date().toISOString()
  }
];
