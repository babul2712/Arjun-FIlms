'use server';

import connectToDatabase from '@/lib/mongoose';
import { revalidatePath } from 'next/cache';
import Project from '@/lib/models/Project';
import Payment from '@/lib/models/Payment';
import Quotation from '@/lib/models/Quotation';
import Booking from '@/lib/models/Booking';
import Crew from '@/lib/models/Crew';
import EventType from '@/lib/models/EventType';
import Otp from '@/lib/models/Otp';
import { Resend } from 'resend';
import bcrypt from 'bcryptjs';
import { generateOTPEmailHtml } from '@/lib/emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY || 'default_key');

export async function getEventTypes() {
  await connectToDatabase();
  const types = await EventType.find({}).sort({ name: 1 }).lean();
  return JSON.parse(JSON.stringify(types));
}

export async function createEventType(name: string) {
  await connectToDatabase();
  try {
    const type = await EventType.create({ name });
    return JSON.parse(JSON.stringify(type));
  } catch (e) {
    const existing = await EventType.findOne({ name }).lean();
    if (existing) return JSON.parse(JSON.stringify(existing));
    throw e;
  }
}

export async function getProjects() {
  await connectToDatabase();
  const projects = await Project.find({}).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(projects));
}

export async function getProjectById(id: string) {
  await connectToDatabase();
  const project = await Project.findById(id).lean() as any;
  if (!project) return null;

  project.quotationsList = await Quotation.find({ projectId: id }).sort({ createdAt: -1 }).lean();
  project.paymentsList = await Payment.find({ projectId: id }).sort({ date: -1 }).lean();

  return JSON.parse(JSON.stringify(project));
}

export async function createProject(data: any) {
  await connectToDatabase();

  const projectNumber = 'PRJ-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  
  // Set default mockup services stages if not supplied
  const services = data.services || [
    { name: 'Request client authorization', status: 'Request client authorization', startedDate: new Date(), daysLeft: 14 },
    { name: 'Assemble Packet', status: 'Assemble Packet', startedDate: new Date(), daysLeft: 3 },
    { name: 'Attorney review FOIA', status: 'Attorney review FOIA', startedDate: new Date(), daysLeft: 1 }
  ];

  const projectData = { ...data, projectNumber, services };
  const project = await Project.create(projectData);
  revalidatePath('/dashboard', 'layout');
  revalidatePath('/projects', 'layout');
  return JSON.parse(JSON.stringify(project));
}

export async function updateProject(id: string, data: any) {
  await connectToDatabase();
  const project = await Project.findByIdAndUpdate(id, data, { new: true });
  revalidatePath('/dashboard', 'layout');
  revalidatePath('/projects', 'layout');
  return JSON.parse(JSON.stringify(project));
}

export async function deleteProject(id: string) {
  await connectToDatabase();
  await Project.findByIdAndDelete(id);
  revalidatePath('/dashboard', 'layout');
  revalidatePath('/projects', 'layout');
  return { success: true };
}

export async function getPayments() {
  await connectToDatabase();
  const payments = await Payment.find({}).sort({ date: -1 }).lean();
  return JSON.parse(JSON.stringify(payments));
}

export async function createPayment(data: any) {
  await connectToDatabase();
  const payment = await Payment.create(data);
  return JSON.parse(JSON.stringify(payment));
}

export async function verifyPayment(id: string, projectId?: string) {
  await connectToDatabase();
  const updateData: any = { status: 'PAID' };
  if (projectId) {
    updateData.projectId = projectId;
  }
  const payment = await Payment.findByIdAndUpdate(id, updateData, { new: true });

  if (projectId) {
    await Project.findByIdAndUpdate(projectId, { $addToSet: { payments: id } });
  }

  revalidatePath('/dashboard', 'layout');
  return JSON.parse(JSON.stringify(payment));
}

export async function addProjectExpense(projectId: string, expense: { date: string, description: string, amount: number }) {
  await connectToDatabase();
  const project = await Project.findByIdAndUpdate(
    projectId,
    { $push: { expenses: expense } },
    { new: true }
  );
  revalidatePath('/projects', 'layout');
  return JSON.parse(JSON.stringify(project));
}

export async function addProjectCrew(projectId: string, crewData: { role: string, assignedCrewId?: string, charges: number }) {
  await connectToDatabase();
  const updateQuery: any = { $push: { crewBlueprint: crewData } };

  if (crewData.charges && crewData.charges > 0) {
    updateQuery.$push.expenses = {
      date: new Date().toISOString(),
      description: `Crew Assigned: ${crewData.role}`,
      amount: crewData.charges
    };
  }

  const project = await Project.findByIdAndUpdate(
    projectId,
    updateQuery,
    { new: true }
  );
  revalidatePath('/projects', 'layout');
  return JSON.parse(JSON.stringify(project));
}

export async function deletePayment(id: string) {
  await connectToDatabase();
  await Payment.findByIdAndDelete(id);
  return { success: true };
}

export async function getQuotations() {
  await connectToDatabase();
  const quotations = await Quotation.find({}).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(quotations));
}

export async function createQuotation(data: any) {
  await connectToDatabase();
  const quotation = await Quotation.create(data);
  revalidatePath('/quotations', 'layout');
  return JSON.parse(JSON.stringify(quotation));
}

export async function getQuotationById(id: string) {
  await connectToDatabase();
  const quotation = await Quotation.findById(id).lean();
  return JSON.parse(JSON.stringify(quotation));
}

export async function updateQuotation(id: string, data: any) {
  await connectToDatabase();
  const quotation = await Quotation.findByIdAndUpdate(id, data, { new: true });
  revalidatePath('/quotations', 'layout');
  return JSON.parse(JSON.stringify(quotation));
}

export async function deleteQuotation(id: string) {
  await connectToDatabase();
  await Quotation.findByIdAndDelete(id);
  revalidatePath('/quotations', 'layout');
  return { success: true };
}

export async function getBookings() {
  await connectToDatabase();
  const bookings = await Booking.find({}).sort({ date: 1 }).lean();
  return JSON.parse(JSON.stringify(bookings));
}

export async function createBooking(data: any) {
  await connectToDatabase();
  const booking = await Booking.create(data);
  return JSON.parse(JSON.stringify(booking));
}

export async function getDashboardStats() {
  await connectToDatabase();
  const totalRevenueAgg = await Payment.aggregate([
    { $match: { status: 'PAID' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  const revenue = totalRevenueAgg.length > 0 ? totalRevenueAgg[0].total : 0;

  const totalProjectValueAgg = await Project.aggregate([
    { $group: { _id: null, total: { $sum: '$totalValue' } } }
  ]);
  const totalProjectValue = totalProjectValueAgg.length > 0 ? totalProjectValueAgg[0].total : 0;

  const pendingPaymentsAmount = Math.max(0, totalProjectValue - revenue);

  const totalBookings = await Booking.countDocuments();
  const totalQuotations = await Quotation.countDocuments();
  const totalProjects = await Project.countDocuments();
  const finishedProjects = await Project.countDocuments({ status: 'Completed' });
  const pendingProjects = await Project.countDocuments({ status: { $ne: 'Completed' } });

  const totalCrew = await Crew.countDocuments();
  const projectsWithCrew = await Project.find({
    status: { $ne: 'Completed' },
    'crewBlueprint.assignedCrewId': { $exists: true, $ne: null }
  }, { crewBlueprint: 1 }).lean();
  const assignedCrewIds = new Set();
  projectsWithCrew.forEach((p: any) => {
    p.crewBlueprint?.forEach((c: any) => {
      if (c.assignedCrewId) assignedCrewIds.add(c.assignedCrewId.toString());
    });
  });
  const totalCrewAssigned = assignedCrewIds.size;
  const totalCrewNotAssigned = totalCrew - totalCrewAssigned;

  return {
    totalQuotations,
    totalBookings,
    pendingPaymentsAmount,
    revenue,
    totalProjects,
    finishedProjects,
    pendingProjects,
    totalCrew,
    totalCrewAssigned,
    totalCrewNotAssigned
  };
}

export async function getCrew() {
  await connectToDatabase();
  const crew = await Crew.find({}).sort({ location: 1, name: 1 }).lean();
  return JSON.parse(JSON.stringify(crew));
}

export async function createCrew(data: any) {
  await connectToDatabase();
  const crew = await Crew.create(data);
  return JSON.parse(JSON.stringify(crew));
}

export async function updateCrew(id: string, data: any) {
  await connectToDatabase();
  const crew = await Crew.findByIdAndUpdate(id, data, { new: true });
  return JSON.parse(JSON.stringify(crew));
}

export async function deleteCrew(id: string) {
  await connectToDatabase();
  await Crew.findByIdAndDelete(id);
  return { success: true };
}

export async function sendLoginOTP(username: string, email: string) {
  await connectToDatabase();

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = await bcrypt.hash(otp, 10);

  await Otp.create({
    email,
    hashedOtp
  });

  // Always log OTP to server console (visible in local terminal & Vercel Dashboard -> Logs)
  console.log(`\n🔑 [LOGIN OTP] OTP for ${email} is: ${otp}\n`);

  try {
    const adminEmail = process.env.RESEND_TO_EMAIL || process.env.ADMIN_EMAIL || email;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_api_key_here') {
      await resend.emails.send({
        from: fromEmail,
        to: adminEmail,
        subject: 'Arjun Photography - Admin Login OTP',
        html: generateOTPEmailHtml(username, otp)
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    // Don't block login if email service is not yet configured; OTP is visible in Vercel logs
    return { success: true };
  }
}

export async function verifyLoginOTP(email: string, otp: string) {
  await connectToDatabase();

  // Master emergency OTP support (e.g. if email is delayed or not configured)
  const masterOtp = process.env.ADMIN_MASTER_OTP || '202600';
  if (otp === masterOtp) {
    return { success: true };
  }

  const otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });

  if (!otpRecord) {
    return { success: false, error: 'OTP expired or not found' };
  }

  const isValid = await bcrypt.compare(otp, otpRecord.hashedOtp);

  if (isValid) {
    await Otp.deleteOne({ _id: otpRecord._id });
    return { success: true };
  } else {
    return { success: false, error: 'Invalid OTP' };
  }
}
