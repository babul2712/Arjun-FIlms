'use server';

import connectToDatabase from '@/lib/mongoose';
import Subscription from '@/lib/models/Subscription';
import SubscriptionPayment from '@/lib/models/SubscriptionPayment';
import SubscriptionShoot from '@/lib/models/SubscriptionShoot';
import { revalidatePath } from 'next/cache';

// ─── HELPERS ────────────────────────────────────────────────────────────────

function generateInvoiceNumber(clientName: string, month: string): string {
  const code = clientName
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 4)
    .toUpperCase();
  const [mon, year] = month.split(' ');
  const months: Record<string, string> = {
    January: '01', February: '02', March: '03', April: '04',
    May: '05', June: '06', July: '07', August: '08',
    September: '09', October: '10', November: '11', December: '12',
  };
  return `INV-${year}${months[mon] || '01'}-${code}`;
}

function safeSerialize(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}

// ─── SUBSCRIPTION CRUD ───────────────────────────────────────────────────────

export async function getSubscriptions() {
  try {
    await connectToDatabase();
    const subs = await Subscription.find({}).sort({ createdAt: -1 }).lean();
    
    // Enrich with shoot stats
    const enriched = await Promise.all(
      subs.map(async (sub: any) => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const shoots = await SubscriptionShoot.find({
          subscriptionId: sub._id,
          scheduledDate: { $gte: monthStart, $lte: monthEnd },
        }).lean();

        const completed = shoots.filter((s: any) => s.status === 'Completed').length;
        const scheduled = shoots.filter((s: any) => s.status === 'Scheduled').length;
        const totalSheduled = shoots.length;

        // Latest payment
        const latestPayment = await SubscriptionPayment.findOne({
          subscriptionId: sub._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        return {
          ...sub,
          _id: sub._id.toString(),
          completedShoots: completed,
          scheduledShoots: scheduled,
          totalShootsThisMonth: totalSheduled,
          remainingShoots: sub.totalMonthlyDays - completed,
          perDayValue: sub.totalMonthlyDays > 0 ? Math.round(sub.monthlyFee / sub.totalMonthlyDays) : 0,
          latestPaymentStatus: (latestPayment as any)?.status || null,
        };
      })
    );

    return safeSerialize(enriched);
  } catch (err) {
    console.error('getSubscriptions error:', err);
    return [];
  }
}

export async function getSubscriptionById(id: string) {
  try {
    await connectToDatabase();
    const sub = await Subscription.findById(id).lean();
    if (!sub) return null;

    const shoots = await SubscriptionShoot.find({ subscriptionId: id })
      .sort({ scheduledDate: 1 })
      .lean();

    const payments = await SubscriptionPayment.find({ subscriptionId: id })
      .sort({ createdAt: -1 })
      .lean();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisMonthShoots = shoots.filter((s: any) => {
      const d = new Date(s.scheduledDate);
      return d >= monthStart && d <= monthEnd;
    });

    const completedThisMonth = thisMonthShoots.filter((s: any) => s.status === 'Completed').length;
    const sub_any = sub as any;
    return safeSerialize({
      ...sub,
      _id: sub_any._id.toString(),
      shoots,
      payments,
      stats: {
        completedThisMonth,
        totalThisMonth: thisMonthShoots.length,
        remaining: sub_any.totalMonthlyDays - completedThisMonth,
        perDayValue: sub_any.totalMonthlyDays > 0
          ? Math.round(sub_any.monthlyFee / sub_any.totalMonthlyDays)
          : 0,
      },
    });
  } catch (err) {
    console.error('getSubscriptionById error:', err);
    return null;
  }
}

export async function createSubscription(data: {
  clientName: string;
  businessType?: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  ownerAddress?: string;
  subscriptionPlan: string;
  monthlyFee: number;
  workingDaysPerWeek: number;
  totalMonthlyDays: number;
  startDate: string;
  endDate?: string;
  renewalDate?: string;
  status?: string;
  logoUrl?: string;
  notes?: string;
  colorTag?: string;
}) {
  try {
    await connectToDatabase();
    const sub = new Subscription({
      ...data,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      renewalDate: data.renewalDate ? new Date(data.renewalDate) : undefined,
    });
    await sub.save();
    revalidatePath('/subscriptions');
    return { success: true, id: sub._id.toString() };
  } catch (err: any) {
    console.error('createSubscription error:', err);
    return { success: false, error: err.message };
  }
}

export async function updateSubscription(id: string, data: Partial<{
  clientName: string;
  businessType: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerAddress: string;
  subscriptionPlan: string;
  monthlyFee: number;
  workingDaysPerWeek: number;
  totalMonthlyDays: number;
  startDate: string;
  endDate: string;
  renewalDate: string;
  status: string;
  logoUrl: string;
  notes: string;
  colorTag: string;
}>) {
  try {
    await connectToDatabase();
    const update: any = { ...data };
    if (data.startDate) update.startDate = new Date(data.startDate);
    if (data.endDate) update.endDate = new Date(data.endDate);
    if (data.renewalDate) update.renewalDate = new Date(data.renewalDate);
    await Subscription.findByIdAndUpdate(id, update);
    revalidatePath('/subscriptions');
    revalidatePath(`/subscriptions/${id}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteSubscription(id: string) {
  try {
    await connectToDatabase();
    await Subscription.findByIdAndDelete(id);
    await SubscriptionShoot.deleteMany({ subscriptionId: id });
    await SubscriptionPayment.deleteMany({ subscriptionId: id });
    revalidatePath('/subscriptions');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── SHOOT CRUD ──────────────────────────────────────────────────────────────

export async function getSubscriptionShoots(subscriptionId: string) {
  try {
    await connectToDatabase();
    const shoots = await SubscriptionShoot.find({ subscriptionId })
      .sort({ scheduledDate: 1 })
      .lean();
    return safeSerialize(shoots);
  } catch (err) {
    console.error('getSubscriptionShoots error:', err);
    return [];
  }
}

export async function createSubscriptionShoot(data: {
  subscriptionId: string;
  clientName: string;
  scheduledDate: string;
  shootType?: string;
  location?: string;
  notes?: string;
}) {
  try {
    await connectToDatabase();
    const shoot = new SubscriptionShoot({
      ...data,
      scheduledDate: new Date(data.scheduledDate),
    });
    await shoot.save();
    revalidatePath(`/subscriptions/${data.subscriptionId}`);
    return { success: true, id: shoot._id.toString() };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateSubscriptionShoot(
  id: string,
  data: {
    status?: string;
    completedAt?: string;
    cancelledAt?: string;
    rescheduledTo?: string;
    deliverables?: string;
    notes?: string;
    shootType?: string;
    location?: string;
    scheduledDate?: string;
  }
) {
  try {
    await connectToDatabase();
    const update: any = { ...data };
    if (data.completedAt) update.completedAt = new Date(data.completedAt);
    if (data.cancelledAt) update.cancelledAt = new Date(data.cancelledAt);
    if (data.rescheduledTo) update.rescheduledTo = new Date(data.rescheduledTo);
    if (data.scheduledDate) update.scheduledDate = new Date(data.scheduledDate);
    await SubscriptionShoot.findByIdAndUpdate(id, update);
    revalidatePath('/subscriptions');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function bulkScheduleShoots(
  subscriptionId: string,
  clientName: string,
  dates: string[],
  shootType?: string,
  location?: string
) {
  try {
    await connectToDatabase();
    const docs = dates.map((d) => ({
      subscriptionId,
      clientName,
      scheduledDate: new Date(d),
      status: 'Scheduled',
      shootType: shootType || 'Photography & Videography',
      location: location || '',
    }));
    await SubscriptionShoot.insertMany(docs);
    revalidatePath(`/subscriptions/${subscriptionId}`);
    return { success: true, count: docs.length };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteSubscriptionShoot(id: string, subscriptionId: string) {
  try {
    await connectToDatabase();
    await SubscriptionShoot.findByIdAndDelete(id);
    revalidatePath(`/subscriptions/${subscriptionId}`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── PAYMENT CRUD ────────────────────────────────────────────────────────────

export async function getSubscriptionPayments(subscriptionId: string) {
  try {
    await connectToDatabase();
    const payments = await SubscriptionPayment.find({ subscriptionId })
      .sort({ createdAt: -1 })
      .lean();
    return safeSerialize(payments);
  } catch (err) {
    return [];
  }
}

export async function createSubscriptionPayment(data: {
  subscriptionId: string;
  clientName: string;
  month: string;
  amount: number;
  status?: string;
  paidDate?: string;
  dueDate?: string;
  transactionId?: string;
  paymentMethod?: string;
  notes?: string;
}) {
  try {
    await connectToDatabase();
    const invoiceNumber = generateInvoiceNumber(data.clientName, data.month);
    const payment = new SubscriptionPayment({
      ...data,
      invoiceNumber,
      paidDate: data.paidDate ? new Date(data.paidDate) : undefined,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
    });
    await payment.save();
    revalidatePath(`/subscriptions/${data.subscriptionId}`);
    revalidatePath('/subscriptions');
    return { success: true, id: payment._id.toString(), invoiceNumber };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateSubscriptionPayment(
  id: string,
  data: {
    status?: string;
    paidDate?: string;
    transactionId?: string;
    paymentMethod?: string;
    notes?: string;
    amount?: number;
  }
) {
  try {
    await connectToDatabase();
    const update: any = { ...data };
    if (data.paidDate) update.paidDate = new Date(data.paidDate);
    await SubscriptionPayment.findByIdAndUpdate(id, update);
    revalidatePath('/subscriptions');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

export async function getSubscriptionDashboardStats() {
  try {
    await connectToDatabase();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthStr = now.toLocaleString('default', { month: 'long', year: 'numeric' });

    const [allSubs, allPayments, allShoots] = await Promise.all([
      Subscription.find({}).lean(),
      SubscriptionPayment.find({}).lean(),
      SubscriptionShoot.find({
        scheduledDate: { $gte: monthStart, $lte: monthEnd },
      }).lean(),
    ]);

    const activeSubs = allSubs.filter((s: any) => s.status === 'Active');
    const monthlyRevenue = activeSubs.reduce((acc: number, s: any) => acc + s.monthlyFee, 0);

    const thisMonthPayments = allPayments.filter((p: any) => p.month === monthStr);
    const paidThisMonth = thisMonthPayments
      .filter((p: any) => p.status === 'Paid')
      .reduce((acc: number, p: any) => acc + p.amount, 0);
    const pendingAmount = thisMonthPayments
      .filter((p: any) => p.status === 'Pending' || p.status === 'Overdue')
      .reduce((acc: number, p: any) => acc + p.amount, 0);

    const completedShoots = allShoots.filter((s: any) => s.status === 'Completed').length;
    const upcomingShoots = allShoots.filter(
      (s: any) => s.status === 'Scheduled' && new Date(s.scheduledDate) >= now
    ).length;

    // Monthly revenue trend (last 6 months)
    const trend: { month: string; revenue: number; collected: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      const longLabel = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      const monthPayments = allPayments.filter((p: any) => p.month === longLabel);
      const collected = monthPayments
        .filter((p: any) => p.status === 'Paid')
        .reduce((acc: number, p: any) => acc + p.amount, 0);
      
      // Revenue = all active subscriptions at that time (approximation: use current)
      const revenue = activeSubs.reduce((acc: number, s: any) => acc + s.monthlyFee, 0);
      trend.push({ month: label, revenue, collected });
    }

    return safeSerialize({
      totalSubscribers: allSubs.length,
      activeSubscribers: activeSubs.length,
      monthlyRevenue,
      paidThisMonth,
      pendingAmount,
      completedShootsThisMonth: completedShoots,
      upcomingShootsThisMonth: upcomingShoots,
      totalShootsThisMonth: allShoots.length,
      trend,
    });
  } catch (err) {
    console.error('getSubscriptionDashboardStats error:', err);
    return {
      totalSubscribers: 0,
      activeSubscribers: 0,
      monthlyRevenue: 0,
      paidThisMonth: 0,
      pendingAmount: 0,
      completedShootsThisMonth: 0,
      upcomingShootsThisMonth: 0,
      totalShootsThisMonth: 0,
      trend: [],
    };
  }
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

export async function getSubscriptionAnalytics() {
  try {
    await connectToDatabase();
    const [allSubs, allPayments, allShoots] = await Promise.all([
      Subscription.find({}).lean(),
      SubscriptionPayment.find({}).lean(),
      SubscriptionShoot.find({}).lean(),
    ]);

    // Client-wise revenue
    const clientRevenue = allSubs.map((sub: any) => {
      const payments = allPayments.filter(
        (p: any) => p.subscriptionId.toString() === sub._id.toString()
      );
      const collected = payments
        .filter((p: any) => p.status === 'Paid')
        .reduce((acc: number, p: any) => acc + p.amount, 0);
      const pending = payments
        .filter((p: any) => p.status !== 'Paid')
        .reduce((acc: number, p: any) => acc + p.amount, 0);

      const shoots = allShoots.filter(
        (s: any) => s.subscriptionId.toString() === sub._id.toString()
      );
      const completedShoots = shoots.filter((s: any) => s.status === 'Completed').length;

      return {
        clientName: sub.clientName,
        status: sub.status,
        monthlyFee: sub.monthlyFee,
        collected,
        pending,
        totalShoots: shoots.length,
        completedShoots,
        completionRate: shoots.length > 0 ? Math.round((completedShoots / shoots.length) * 100) : 0,
      };
    });

    // Monthly trend (last 12 months)
    const now = new Date();
    const monthlyTrend: { month: string; revenue: number; collected: number; shoots: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const longLabel = d.toLocaleString('default', { month: 'long', year: 'numeric' });
      const shortLabel = d.toLocaleString('default', { month: 'short' });
      const monthPayments = allPayments.filter((p: any) => p.month === longLabel);
      const collected = monthPayments
        .filter((p: any) => p.status === 'Paid')
        .reduce((acc: number, p: any) => acc + p.amount, 0);
      const revenue = monthPayments.reduce((acc: number, p: any) => acc + p.amount, 0);
      const dEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      const shoots = allShoots.filter((s: any) => {
        const sd = new Date(s.scheduledDate);
        return sd >= d && sd <= dEnd;
      }).length;
      monthlyTrend.push({ month: shortLabel, revenue, collected, shoots });
    }

    return safeSerialize({
      clientRevenue,
      monthlyTrend,
      totalRevenue: allPayments
        .filter((p: any) => p.status === 'Paid')
        .reduce((acc: number, p: any) => acc + p.amount, 0),
      totalShoots: allShoots.length,
      completedShoots: allShoots.filter((s: any) => s.status === 'Completed').length,
      activeClients: allSubs.filter((s: any) => s.status === 'Active').length,
    });
  } catch (err) {
    console.error('getSubscriptionAnalytics error:', err);
    return { clientRevenue: [], monthlyTrend: [], totalRevenue: 0, totalShoots: 0, completedShoots: 0, activeClients: 0 };
  }
}

// ─── ALL UPCOMING SHOOTS (for dashboard widget) ───────────────────────────────

export async function getUpcomingSubscriptionShoots(limit = 5) {
  try {
    await connectToDatabase();
    const now = new Date();
    const shoots = await SubscriptionShoot.find({
      scheduledDate: { $gte: now },
      status: 'Scheduled',
    })
      .sort({ scheduledDate: 1 })
      .limit(limit)
      .lean();
    return safeSerialize(shoots);
  } catch (err) {
    return [];
  }
}
