export type Role = 'admin' | 'staff' | 'viewer';

export interface User {
  id: string;
  username: string;
  role: Role;
  name: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Quotation {
  _id?: string;
  id: string;
  customerName: string;
  phone: string;
  email: string;
  location: string;
  bookingDate: string;
  eventType: string;
  services: ServiceItem[];
  discount: number;
  subTotal: number;
  grandTotal: number;
  paymentTerms: string;
  termsConditions: string;
  createdAt: string;
  updatedAt: string;
  projectId?: string;
}

export type PaymentMethod = 'UPI QR' | 'UPI ID' | 'Bank Transfer';
export type PaymentStatus = 'Pending Verification' | 'Verified' | 'Rejected' | 'PAID' | 'PENDING';

export interface Payment {
  _id?: string;
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  quotationId?: string;
  bookingId?: string;
  amount: number;
  paymentMethod: PaymentMethod;
  screenshotUrl: string;
  status: PaymentStatus;
  date: string;
  remarks?: string;
  projectId?: string;
}

export type BookingStatus = 'Upcoming' | 'Completed' | 'Cancelled';

export interface Booking {
  id: string;
  client: string;
  date: string;
  venue: string;
  photographers: string[];
  videographers: string[];
  package: string;
  advancePaid: number;
  pending: number;
  status: BookingStatus;
  createdAt: string;
  projectId?: string;
}

export interface CrewBlueprintItem {
  role: string;
  assignedCrewId?: string;
  charges?: number;
}

export interface IServiceStage {
  name: string;
  startedDate?: string;
  status: string;
  daysLeft?: number;
}

export interface Project {
  id: string;
  projectNumber: string;
  name: string;
  company?: string;
  phone: string;
  email: string;
  location: string;
  eventType: string;
  eventDate?: string;
  status: string;
  notes?: string;
  totalValue: number;
  payments: string[];
  crewBlueprint: CrewBlueprintItem[];
  bookingId?: string;
  expenses: { _id?: string; date: string; description: string; amount: number }[];
  services?: IServiceStage[];
  createdAt: string;
}

export interface Staff {
  _id?: string;
  id: string;
  name: string;
  role: string;
  location: string;
  phone: string;
  address: string;
  charges: number;
  createdAt: string;
}
