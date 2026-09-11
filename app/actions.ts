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
import Notification from '@/lib/models/Notification';
import BioProfile from '@/lib/models/BioProfile';
import { DEFAULT_BIO_DATA } from '@/lib/bioConstants';
import { Resend } from 'resend';
import bcrypt from 'bcryptjs';
import { generateOTPEmailHtml } from '@/lib/emailTemplates';

const resend = new Resend(process.env.RESEND_API_KEY || 'default_key');

const PREDEFINED_EVENT_TYPES = [
  'Wedding Ceremony',
  'Pre-wedding Shoot',
  'Destination Wedding',
  'Engagement / Reception',
  'Corporate Shoot',
  'Commercial & Fashion Session',
  'Maternity & Newborn Shoot',
  'Birthday & Anniversary Event',
];

export async function getEventTypes() {
  try {
    await connectToDatabase();
    let types = await EventType.find({}).sort({ name: 1 }).lean();
    if (!types || types.length === 0) {
      // Seed predefined standard event types
      await EventType.insertMany(PREDEFINED_EVENT_TYPES.map((name) => ({ name })));
      types = await EventType.find({}).sort({ name: 1 }).lean();
    }
    return JSON.parse(JSON.stringify(types));
  } catch (e) {
    console.error('getEventTypes error:', e);
    return PREDEFINED_EVENT_TYPES.map((name) => ({ _id: name, name }));
  }
}

export async function createEventType(name: string) {
  const trimmed = (name || '').trim();
  if (!trimmed) throw new Error('Event type name is required');
  await connectToDatabase();
  try {
    const existing = await EventType.findOne({ name: { $regex: new RegExp(`^${trimmed}$`, 'i') } }).lean();
    if (existing) return JSON.parse(JSON.stringify(existing));

    const type = await EventType.create({ name: trimmed });
    revalidatePath('/quotations', 'layout');
    revalidatePath('/projects', 'layout');
    return JSON.parse(JSON.stringify(type));
  } catch (e) {
    const existing = await EventType.findOne({ name: trimmed }).lean();
    if (existing) return JSON.parse(JSON.stringify(existing));
    throw e;
  }
}

export async function getProjects() {
  try {
    await connectToDatabase();
    const projects = await Project.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(projects));
  } catch (e) {
    console.error('getProjects error:', e);
    return [];
  }
}

export async function getProjectById(id: string) {
  try {
    await connectToDatabase();
    const project = await Project.findById(id).lean() as any;
    if (!project) return null;

    project.quotationsList = await Quotation.find({ projectId: id }).sort({ createdAt: -1 }).lean();
    project.paymentsList = await Payment.find({ projectId: id }).sort({ date: -1 }).lean();

    return JSON.parse(JSON.stringify(project));
  } catch (e) {
    console.error('getProjectById error:', e);
    return null;
  }
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

export async function toggleProjectStar(id: string) {
  try {
    await connectToDatabase();
    const proj = await Project.findById(id);
    if (!proj) return { success: false, error: 'Project not found' };

    proj.isStarred = !proj.isStarred;
    await proj.save();

    revalidatePath('/dashboard', 'layout');
    revalidatePath('/projects', 'layout');
    return { success: true, isStarred: proj.isStarred, project: JSON.parse(JSON.stringify(proj)) };
  } catch (err: any) {
    console.error('toggleProjectStar error:', err);
    return { success: false, error: err?.message };
  }
}

export async function deleteProject(id: string) {
  await connectToDatabase();
  await Project.findByIdAndDelete(id);
  revalidatePath('/dashboard', 'layout');
  revalidatePath('/projects', 'layout');
  return { success: true };
}

export async function getPayments() {
  try {
    await connectToDatabase();
    const payments = await Payment.find({}).sort({ date: -1 }).lean();
    return JSON.parse(JSON.stringify(payments));
  } catch (e) {
    console.error('getPayments error:', e);
    return [];
  }
}

export async function createPayment(data: any) {
  try {
    await connectToDatabase();
    const paymentData = {
      ...data,
      customerId: data.customerId || data.phone || 'client_' + Date.now(),
      status: data.status || 'PENDING',
      date: data.date ? new Date(data.date) : new Date()
    };
    const payment = await Payment.create(paymentData);
    
    // Auto-create notification for new payment
    try {
      await Notification.create({
        title: 'New Client Payment Received',
        message: `${paymentData.customerName || 'A client'} submitted ₹${Number(paymentData.amount).toLocaleString('en-IN')} via ${paymentData.paymentMethod || 'UPI'}`,
        type: 'payment',
        link: '/payments',
        amount: Number(paymentData.amount),
        read: false
      });
    } catch (notifErr) {
      console.warn('Failed to auto-create notification for payment:', notifErr);
    }

    revalidatePath('/dashboard', 'layout');
    revalidatePath('/payments', 'layout');
    return JSON.parse(JSON.stringify(payment));
  } catch (err: any) {
    console.error('createPayment error:', err);
    throw new Error(err?.message || 'Failed to record payment');
  }
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
  try {
    await connectToDatabase();
    const quotations = await Quotation.find({}).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(quotations));
  } catch (e) {
    console.error('getQuotations error:', e);
    return [];
  }
}

export async function createQuotation(data: any) {
  await connectToDatabase();
  const quotation = await Quotation.create(data);
  revalidatePath('/quotations', 'layout');
  return JSON.parse(JSON.stringify(quotation));
}

export async function getQuotationById(id: string) {
  try {
    await connectToDatabase();
    const quotation = await Quotation.findById(id).lean();
    return JSON.parse(JSON.stringify(quotation));
  } catch (e) {
    console.error('getQuotationById error:', e);
    return null;
  }
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
  try {
    await connectToDatabase();
    const bookings = await Booking.find({}).sort({ date: 1 }).lean();
    return JSON.parse(JSON.stringify(bookings));
  } catch (e) {
    console.error('getBookings error:', e);
    return [];
  }
}

export async function createBooking(data: any) {
  await connectToDatabase();
  const booking = await Booking.create(data);
  return JSON.parse(JSON.stringify(booking));
}

export async function getDashboardStats() {
  try {
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
  } catch (e) {
    console.error('getDashboardStats error:', e);
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
}

export async function getCrew() {
  try {
    await connectToDatabase();
    let crew = await Crew.find({}).sort({ location: 1, name: 1 }).lean();
    if (!crew || crew.length === 0) {
      const defaultCrew = [
        {
          name: 'Davidson Kumar',
          role: 'Lead Cinematographer & Drone Pilot',
          location: 'Bhubaneswar, Odisha',
          phone: '+91 98765 43210',
          address: 'Plot 42, Saheed Nagar, Bhubaneswar',
          charges: 15000,
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80'
        },
        {
          name: 'Veronica Roy',
          role: 'Senior Candid & Bridal Photographer',
          location: 'Cuttack / Bhubaneswar',
          phone: '+91 91234 56789',
          address: 'Studio 7, CDA Sector 9, Cuttack',
          charges: 18000,
          avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400&q=80'
        },
        {
          name: 'Harris Samal',
          role: 'Traditional 4K Video Operator',
          location: 'Puri / Bhubaneswar',
          phone: '+91 97788 99271',
          address: 'VIP Road, Puri',
          charges: 12000,
          avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400&h=400&q=80'
        },
        {
          name: 'Arjun Nayak',
          role: 'Creative Director & Master Colorist',
          location: 'Bhubaneswar, Odisha',
          phone: '+91 77889 92712',
          address: 'Arjun Studio, Infocity, Bhubaneswar',
          charges: 25000,
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80'
        }
      ];
      try {
        await Crew.insertMany(defaultCrew);
        crew = await Crew.find({}).sort({ location: 1, name: 1 }).lean();
      } catch (seedErr) {
        console.error('Seed error:', seedErr);
      }
    }
    return JSON.parse(JSON.stringify(crew));
  } catch (e) {
    console.error('getCrew error:', e);
    return [];
  }
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

export async function sendLoginOTP(username: string, email: string): Promise<{ success: boolean; error?: string }> {
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
  } catch (error: any) {
    console.error('Error sending OTP email:', error);
    // Don't block login if email service is not yet configured; OTP is visible in Vercel logs
    return { success: true, error: error?.message };
  }
}

export async function verifyLoginOTP(email: string, otp: string): Promise<{ success: boolean; error?: string }> {
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

// ----------------------------------------------------
// NOTIFICATION SYSTEM SERVER ACTIONS
// ----------------------------------------------------

export async function getNotifications() {
  try {
    await connectToDatabase();
    const notifications = await Notification.find({}).sort({ createdAt: -1 }).limit(50).lean();
    return JSON.parse(JSON.stringify(notifications));
  } catch (error) {
    console.error('getNotifications error:', error);
    return [];
  }
}

export async function createNotification(data: {
  title: string;
  message: string;
  type?: 'payment' | 'shoot' | 'project' | 'quotation' | 'crew';
  link?: string;
  amount?: number;
  read?: boolean;
}) {
  try {
    await connectToDatabase();
    const notif = await Notification.create({
      title: data.title,
      message: data.message,
      type: data.type || 'payment',
      link: data.link || '/dashboard',
      amount: data.amount,
      read: data.read || false,
      createdAt: new Date()
    });
    revalidatePath('/dashboard', 'layout');
    return JSON.parse(JSON.stringify(notif));
  } catch (error) {
    console.error('createNotification error:', error);
    return null;
  }
}

export async function markNotificationAsRead(id: string) {
  try {
    await connectToDatabase();
    const updated = await Notification.findByIdAndUpdate(id, { read: true }, { new: true });
    revalidatePath('/dashboard', 'layout');
    return JSON.parse(JSON.stringify(updated));
  } catch (error) {
    console.error('markNotificationAsRead error:', error);
    return null;
  }
}

export async function markAllNotificationsAsRead() {
  try {
    await connectToDatabase();
    await Notification.updateMany({ read: false }, { read: true });
    revalidatePath('/dashboard', 'layout');
    return { success: true };
  } catch (error) {
    console.error('markAllNotificationsAsRead error:', error);
    return { success: false };
  }
}

export async function deleteNotification(id: string) {
  try {
    await connectToDatabase();
    await Notification.findByIdAndDelete(id);
    revalidatePath('/dashboard', 'layout');
    return { success: true };
  } catch (error) {
    console.error('deleteNotification error:', error);
    return { success: false };
  }
}

export async function clearAllNotifications() {
  try {
    await connectToDatabase();
    await Notification.deleteMany({ read: true });
    revalidatePath('/dashboard', 'layout');
    return { success: true };
  } catch (error) {
    console.error('clearAllNotifications error:', error);
    return { success: false };
  }
}

// ----------------------------------------------------
// BIO & SOCIAL LINKS SERVER ACTIONS
// ----------------------------------------------------

export async function getPublicBioProfile(slug: string = 'arjunfilms') {
  try {
    await connectToDatabase();
    let profile = await BioProfile.findOne({ slug }).lean();

    if (!profile) {
      // Seed default profile
      const newDoc = await BioProfile.create({ ...DEFAULT_BIO_DATA, slug });
      profile = JSON.parse(JSON.stringify(newDoc));
    }

    // Fire & forget: increment public page views count
    BioProfile.updateOne({ slug }, { $inc: { viewsCount: 1 } }).catch((err: any) =>
      console.error('Increment views error:', err)
    );

    const safeProfile = JSON.parse(JSON.stringify(profile));

    // Filter only active links for public viewing and sort by order
    safeProfile.socialLinks = (safeProfile.socialLinks || [])
      .filter((link: any) => link.isActive !== false)
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    safeProfile.customLinks = (safeProfile.customLinks || [])
      .filter((link: any) => link.isActive !== false)
      .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    return safeProfile;
  } catch (error) {
    console.error('getPublicBioProfile error, returning default data:', error);
    return DEFAULT_BIO_DATA;
  }
}

export async function getBioProfileAdmin(slug: string = 'arjunfilms') {
  try {
    await connectToDatabase();
    let profile = await BioProfile.findOne({ slug }).lean();

    if (!profile) {
      const newDoc = await BioProfile.create({ ...DEFAULT_BIO_DATA, slug });
      profile = JSON.parse(JSON.stringify(newDoc));
    }

    const safeProfile = JSON.parse(JSON.stringify(profile));

    // Ensure sorted arrays
    safeProfile.socialLinks = (safeProfile.socialLinks || []).sort(
      (a: any, b: any) => (a.order || 0) - (b.order || 0)
    );
    safeProfile.customLinks = (safeProfile.customLinks || []).sort(
      (a: any, b: any) => (a.order || 0) - (b.order || 0)
    );

    return safeProfile;
  } catch (error) {
    console.error('getBioProfileAdmin error:', error);
    return DEFAULT_BIO_DATA;
  }
}

export async function updateBioProfile(data: any, slug: string = 'arjunfilms') {
  try {
    await connectToDatabase();
    const updated = await BioProfile.findOneAndUpdate(
      { slug },
      { $set: data },
      { new: true, upsert: true }
    ).lean();

    revalidatePath('/links');
    revalidatePath('/bio');
    revalidatePath('/social-links');
    return { success: true, profile: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    console.error('updateBioProfile error:', error);
    return { success: false, error: error?.message || 'Failed to update profile' };
  }
}

export async function saveSocialLinks(socialLinks: any[], slug: string = 'arjunfilms') {
  try {
    await connectToDatabase();
    const updated = await BioProfile.findOneAndUpdate(
      { slug },
      { $set: { socialLinks } },
      { new: true, upsert: true }
    ).lean();

    revalidatePath('/links');
    revalidatePath('/bio');
    revalidatePath('/social-links');
    return { success: true, profile: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    console.error('saveSocialLinks error:', error);
    return { success: false, error: error?.message || 'Failed to save social links' };
  }
}

export async function saveCustomLinks(customLinks: any[], slug: string = 'arjunfilms') {
  try {
    await connectToDatabase();
    const updated = await BioProfile.findOneAndUpdate(
      { slug },
      { $set: { customLinks } },
      { new: true, upsert: true }
    ).lean();

    revalidatePath('/links');
    revalidatePath('/bio');
    revalidatePath('/social-links');
    return { success: true, profile: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    console.error('saveCustomLinks error:', error);
    return { success: false, error: error?.message || 'Failed to save custom links' };
  }
}

export async function trackBioLinkClick(
  linkId: string,
  linkType: 'social' | 'custom',
  slug: string = 'arjunfilms'
) {
  try {
    await connectToDatabase();
    if (linkType === 'social') {
      await BioProfile.updateOne(
        { slug, 'socialLinks.id': linkId },
        {
          $inc: {
            'socialLinks.$.clickCount': 1,
            totalClicks: 1,
          },
        }
      );
    } else {
      await BioProfile.updateOne(
        { slug, 'customLinks.id': linkId },
        {
          $inc: {
            'customLinks.$.clickCount': 1,
            totalClicks: 1,
          },
        }
      );
    }
    return { success: true };
  } catch (error) {
    console.error('trackBioLinkClick error:', error);
    return { success: false };
  }
}

export async function resetBioProfileToDefault(slug: string = 'arjunfilms') {
  try {
    await connectToDatabase();
    const updated = await BioProfile.findOneAndUpdate(
      { slug },
      { $set: DEFAULT_BIO_DATA },
      { new: true, upsert: true }
    ).lean();

    revalidatePath('/links');
    revalidatePath('/bio');
    revalidatePath('/social-links');
    return { success: true, profile: JSON.parse(JSON.stringify(updated)) };
  } catch (error: any) {
    console.error('resetBioProfileToDefault error:', error);
    return { success: false, error: error?.message || 'Failed to reset profile' };
  }
}

export async function uploadImageToCloudinaryAction(
  base64Data: string,
  folder: string = 'general'
) {
  try {
    const { uploadToCloudinary } = await import('@/lib/cloudinary');
    const res = await uploadToCloudinary(base64Data, folder);
    return res;
  } catch (error: any) {
    console.error('uploadImageToCloudinaryAction error:', error);
    return { success: false, url: '', error: error?.message || 'Failed to upload image' };
  }
}

export async function getStudioStatsAction() {
  try {
    await connectToDatabase();
    const [
      totalProjects,
      totalQuotations,
      totalCrew,
      totalPayments,
      bioProfile,
    ] = await Promise.all([
      Project.countDocuments(),
      Quotation.countDocuments(),
      Crew.countDocuments(),
      Payment.find({ status: { $in: ['PAID', 'Verified'] } }).select('amount').lean(),
      BioProfile.findOne({ slug: 'arjunfilms' }).select('viewsCount totalClicks').lean(),
    ]);

    const totalCollected = (totalPayments || []).reduce((acc: number, curr: any) => acc + (curr?.amount || 0), 0);

    return {
      success: true,
      stats: {
        totalProjects: totalProjects || 0,
        totalQuotations: totalQuotations || 0,
        totalCrew: totalCrew || 0,
        totalCollected: totalCollected || 0,
        bioViews: bioProfile?.viewsCount || 0,
        bioClicks: bioProfile?.totalClicks || 0,
      },
    };
  } catch (error) {
    console.error('getStudioStatsAction error:', error);
    return {
      success: false,
      stats: {
        totalProjects: 0,
        totalQuotations: 0,
        totalCrew: 0,
        totalCollected: 0,
        bioViews: 0,
        bioClicks: 0,
      },
    };
  }
}

export async function searchUniversalAction(rawQuery: string = '') {
  try {
    await connectToDatabase();
    const query = (rawQuery || '').trim();
    const safeRegexStr = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = query ? new RegExp(safeRegexStr, 'i') : null;

    // Quick System Navigation Items
    const STATIC_ACTIONS = [
      {
        id: 'act_new_project',
        category: 'actions' as const,
        title: 'Create New Case / Client Project',
        subtitle: 'Start a new client file with custom deliverables & milestones',
        badge: 'Action',
        badgeColor: 'bg-red-500/10 text-[#e50914] border-red-500/20',
        icon: 'folder-plus',
        url: '/projects/create',
        keywords: ['new', 'create', 'case', 'project', 'client', 'booking', 'shoot'],
      },
      {
        id: 'act_new_quote',
        category: 'actions' as const,
        title: 'Generate Client Quotation',
        subtitle: 'Create a customized PDF quotation package with pricing items',
        badge: 'Action',
        badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
        icon: 'file-text',
        url: '/quotations/create',
        keywords: ['quote', 'quotation', 'invoice', 'proposal', 'estimate', 'pricing', 'bill'],
      },
      {
        id: 'act_crew_blueprints',
        category: 'actions' as const,
        title: 'Crew Blueprint Database',
        subtitle: 'Manage cinematographers, photographers, drone pilots & daily rates',
        badge: 'Blueprint',
        badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        icon: 'users',
        url: '/blueprints',
        keywords: ['crew', 'photographer', 'cinematographer', 'editor', 'drone', 'team', 'blueprint', 'staff'],
      },
      {
        id: 'act_calendar',
        category: 'actions' as const,
        title: 'Event Calendar & Shoot Schedule',
        subtitle: 'View upcoming wedding shoot dates, milestones & schedules',
        badge: 'Schedule',
        badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        icon: 'calendar',
        url: '/calendar',
        keywords: ['calendar', 'date', 'schedule', 'shoot', 'upcoming', 'event', 'month'],
      },
      {
        id: 'act_payments',
        category: 'actions' as const,
        title: 'Payments & Collections Ledger',
        subtitle: 'Verify UPI payments, QR receipts, advances & bank transactions',
        badge: 'Finance',
        badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        icon: 'credit-card',
        url: '/payments',
        keywords: ['payment', 'upi', 'received', 'advance', 'transaction', 'utr', 'money', 'revenue'],
      },
      {
        id: 'act_social_links',
        category: 'actions' as const,
        title: 'Bio & Social Links Manager',
        subtitle: 'Manage showreel buttons, portfolio links & track bio clicks',
        badge: 'Bio Link',
        badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
        icon: 'share-2',
        url: '/social-links',
        keywords: ['bio', 'links', 'social', 'instagram', 'youtube', 'tree', 'profile', 'public'],
      },
      {
        id: 'act_profile_settings',
        category: 'actions' as const,
        title: 'Studio Profile & Typography Settings',
        subtitle: 'Customize branding logo, watermark, theme mode & full-site font',
        badge: 'Settings',
        badgeColor: 'bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20',
        icon: 'settings',
        url: '/profile',
        keywords: ['profile', 'settings', 'font', 'theme', 'typography', 'logo', 'watermark', 'branding'],
      },
    ];

    let matchedActions = STATIC_ACTIONS;
    if (query) {
      const qLower = query.toLowerCase();
      matchedActions = STATIC_ACTIONS.filter(
        (a) =>
          a.title.toLowerCase().includes(qLower) ||
          a.subtitle.toLowerCase().includes(qLower) ||
          a.keywords.some((k) => k.includes(qLower) || qLower.includes(k))
      );
    }

    // Database Queries
    let projectResults: any[] = [];
    let crewResults: any[] = [];
    let quotationResults: any[] = [];
    let paymentResults: any[] = [];

    if (regex) {
      const [pRes, cRes, qRes, payRes] = await Promise.all([
        Project.find({
          $or: [
            { name: regex },
            { company: regex },
            { phone: regex },
            { email: regex },
            { location: regex },
            { eventType: regex },
            { status: regex },
            { projectNumber: regex },
            { notes: regex },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(8)
          .lean(),
        Crew.find({
          $or: [
            { name: regex },
            { role: regex },
            { location: regex },
            { phone: regex },
            { address: regex },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(8)
          .lean(),
        Quotation.find({
          $or: [
            { customerName: regex },
            { phone: regex },
            { email: regex },
            { location: regex },
            { eventType: regex },
          ],
        })
          .sort({ createdAt: -1 })
          .limit(8)
          .lean(),
        Payment.find({
          $or: [
            { customerName: regex },
            { phone: regex },
            { paymentMethod: regex },
            { status: regex },
            { remarks: regex },
          ],
        })
          .sort({ date: -1 })
          .limit(8)
          .lean(),
      ]);

      projectResults = pRes || [];
      crewResults = cRes || [];
      quotationResults = qRes || [];
      paymentResults = payRes || [];
    } else {
      // Return recent top items if query is empty
      const [pRes, cRes, qRes] = await Promise.all([
        Project.find({}).sort({ createdAt: -1 }).limit(3).lean(),
        Crew.find({}).sort({ createdAt: -1 }).limit(3).lean(),
        Quotation.find({}).sort({ createdAt: -1 }).limit(2).lean(),
      ]);
      projectResults = pRes || [];
      crewResults = cRes || [];
      quotationResults = qRes || [];
    }

    // Transform into standard UniversalSearchResultItem
    const formattedCases = projectResults.map((p: any) => ({
      id: p._id?.toString() || p.id,
      category: 'cases' as const,
      title: p.name || 'Untitled Case',
      subtitle: `${p.eventType || 'Shoot'} • ${p.location || 'Studio HQ'}${p.eventDate ? ` • ${new Date(p.eventDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}` : ''}`,
      badge: p.status || 'Active',
      badgeColor:
        p.status === 'Booked'
          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
          : p.status === 'Lead'
          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
          : p.status === 'Completed'
          ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
          : 'bg-gray-500/10 text-gray-600 border-gray-500/20',
      icon: 'briefcase',
      url: `/projects/${p._id?.toString() || p.id}`,
      amount: p.totalValue || 0,
      meta: {
        coverImage: p.coverImage,
        phone: p.phone,
        email: p.email,
        isStarred: p.isStarred,
        projectNumber: p.projectNumber,
      },
    }));

    const formattedCrew = crewResults.map((c: any) => ({
      id: c._id?.toString() || c.id,
      category: 'crew' as const,
      title: c.name || 'Crew Member',
      subtitle: `${c.role || 'Operator'} • ${c.location || 'Base City'}${c.phone ? ` • ${c.phone}` : ''}`,
      badge: c.charges ? `₹${c.charges.toLocaleString('en-IN')}/day` : 'Crew',
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      icon: 'camera',
      url: `/blueprints?crewId=${c._id?.toString() || c.id}`,
      amount: c.charges || 0,
      meta: {
        avatarUrl: c.avatarUrl,
        phone: c.phone,
        role: c.role,
        address: c.address,
      },
    }));

    const formattedQuotes = quotationResults.map((q: any) => ({
      id: q._id?.toString() || q.id,
      category: 'quotations' as const,
      title: `${q.customerName || 'Client'} - ${q.eventType || 'Package'}`,
      subtitle: `${q.location || 'Location'}${q.email ? ` • ${q.email}` : ''}${q.services ? ` • ${q.services.length} services` : ''}`,
      badge: q.grandTotal ? `₹${q.grandTotal.toLocaleString('en-IN')}` : 'Quote',
      badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      icon: 'file-text',
      url: `/quotations/edit/${q._id?.toString() || q.id}`,
      amount: q.grandTotal || 0,
      meta: {
        phone: q.phone,
        email: q.email,
        subTotal: q.subTotal,
        discount: q.discount,
      },
    }));

    const formattedPayments = paymentResults.map((pay: any) => ({
      id: pay._id?.toString() || pay.id,
      category: 'payments' as const,
      title: `Payment: ${pay.customerName || 'Client'}`,
      subtitle: `${pay.paymentMethod || 'UPI'} • ${pay.remarks || 'Advance deposit'}${pay.date ? ` • ${new Date(pay.date).toLocaleDateString('en-IN')}` : ''}`,
      badge: pay.amount ? `₹${pay.amount.toLocaleString('en-IN')}` : 'Payment',
      badgeColor:
        pay.status === 'PAID' || pay.status === 'Verified'
          ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
          : 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      icon: 'credit-card',
      url: '/payments',
      amount: pay.amount || 0,
      meta: {
        status: pay.status,
        phone: pay.phone,
        method: pay.paymentMethod,
        screenshotUrl: pay.screenshotUrl,
      },
    }));

    const allResults = [
      ...matchedActions,
      ...formattedCases,
      ...formattedCrew,
      ...formattedQuotes,
      ...formattedPayments,
    ];

    return {
      success: true,
      query,
      totalCount: allResults.length,
      results: JSON.parse(JSON.stringify(allResults)),
      categoriesCount: {
        all: allResults.length,
        actions: matchedActions.length,
        cases: formattedCases.length,
        crew: formattedCrew.length,
        quotations: formattedQuotes.length,
        payments: formattedPayments.length,
      },
    };
  } catch (error: any) {
    console.error('searchUniversalAction error:', error);
    return {
      success: false,
      query: rawQuery,
      totalCount: 0,
      results: [],
      categoriesCount: { all: 0, actions: 0, cases: 0, crew: 0, quotations: 0, payments: 0 },
      error: error?.message || 'Search execution failed',
    };
  }
}




