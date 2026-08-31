import { Project, Payment, Quotation, Booking } from '@/lib/types';
import * as actions from '@/app/actions';

export const getDashboardStats = async () => {
  try {
    const stats = await actions.getDashboardStats();
    return stats;
  } catch (e) {
    console.error(e);
    return {
      totalQuotations: 0,
      totalBookings: 0,
      pendingPaymentsAmount: 0,
      revenue: 0,
      totalProjects: 0,
      finishedProjects: 0,
      pendingProjects: 0,
      totalCrew: 0,
      totalCrewAssigned: 0,
      totalCrewNotAssigned: 0
    };
  }
};

export const getRecentActivity = async () => {
  try {
    const payments = await actions.getPayments();
    return payments.slice(0, 5);
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getProjects = async (): Promise<Project[]> => {
  try {
    const projects = await actions.getProjects();
    return projects.map((c: any) => ({
      ...c,
      id: c._id.toString()
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const getPayments = async (): Promise<Payment[]> => {
  try {
    const payments = await actions.getPayments();
    return payments.map((p: any) => ({
      ...p,
      id: p._id.toString()
    }));
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const createQuotation = async (data: any): Promise<Quotation> => {
  const quotation = await actions.createQuotation(data);
  return { ...quotation, id: quotation._id.toString() };
};

export const createPayment = async (data: any): Promise<Payment> => {
  const payment = await actions.createPayment(data);
  return { ...payment, id: payment._id.toString() };
};

export const createProject = async (data: any): Promise<Project> => {
  const project = await actions.createProject(data);
  return { ...project, id: project._id.toString() };
};
