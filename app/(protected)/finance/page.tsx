'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  DollarSign,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  CreditCard,
  Building2,
  Tag,
  FileSpreadsheet,
  Download,
  Upload,
  FileUp,
  FileDown,
  Activity,
  LineChart as LineChartIcon,
  ShieldCheck,
  Scale,
  LayoutGrid,
  Columns3,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { toast } from 'sonner';
import {
  getFinanceData,
  createFinanceEntry,
  updateFinanceEntry,
  deleteFinanceEntry,
  updateBudgetCategory,
  resetToDefaultFinanceData,
  populateSampleMonthData,
  importBatchFinanceEntries
} from '@/app/actions';
import {
  exportToExcelWorkbook,
  exportSingleSectionCSV,
  parseImportFile
} from '@/lib/financeSheetUtils';
import AutoSearchInput from '@/components/ui/AutoSearchInput';

const EXPENSE_CATEGORIES = [
  'Things',
  'Others',
  'Travel',
  'Family',
  'Fashion',
  'Party & Feast',
  'Sweets & Tifin',
  'Phone Electricity',
  'Medical',
  'Gear & Equipment',
  'Food & Grocery',
  'Rent & Studio',
  'Marketing'
];

const INCOME_CATEGORIES = [
  'Graphic & Design',
  'Crypto',
  'Wedding Shoot',
  'Commercial Project',
  'Share Market',
  'Consulting',
  'Recharge',
  'Others'
];

const INVESTMENT_CATEGORIES = [
  'Crypto Portfolio',
  'Mutual Funds & SIP',
  'Share Market / Stocks',
  'Camera & Studio Gear',
  'Gold / Precious Metals',
  'Real Estate & Land',
  'Fixed Deposit'
];

const PAYMENT_METHODS = [
  'UPI / QR',
  'Cash',
  'Bank Transfer (IMPS/NEFT)',
  'Credit Card',
  'Crypto Wallet',
  'Cheque'
];

const MONTH_OPTIONS = [
  { value: 'all', label: 'All Months' },
  { value: '0', label: 'January' },
  { value: '1', label: 'February' },
  { value: '2', label: 'March' },
  { value: '3', label: 'April' },
  { value: '4', label: 'May' },
  { value: '5', label: 'June' },
  { value: '6', label: 'July' },
  { value: '7', label: 'August' },
  { value: '8', label: 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' }
];

// Apple Numbers Color Definitions
const NUMBERS_COLORS = {
  cryptoGreen: '#4ade80', // Apple Leaf Green
  designBlue: '#3b82f6',  // Apple Electric Blue
  budgetYellow: '#e59e1b', // Apple Golden Yellow
  actualTaupe: '#8c7d6c', // Apple Warm Earthy Slate/Taupe
  thingsGreen: '#53685e', // Apple Deep Slate Green
  othersBrown: '#877a6a', // Apple Muted Brown
  travelOrange: '#cc7843', // Apple Terracotta
  familyRust: '#ab5138',  // Apple Rust
  balanceGreen: '#9ec76f', // Apple Soft Lime Green
  expenditureGray: '#807c78' // Apple Slate Gray
};

// Custom Apple Numbers Callout Label for Donut Chart
const renderCustomDonutLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, fill } = props;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 22;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  const elbowRadius = outerRadius + 10;
  const ex = cx + elbowRadius * Math.cos(-midAngle * RADIAN);
  const ey = cy + elbowRadius * Math.sin(-midAngle * RADIAN);

  const isRight = x > cx;
  const pctStr = `${(percent * 100).toFixed(0)}%`;

  return (
    <g>
      <polyline
        points={`${cx + outerRadius * Math.cos(-midAngle * RADIAN)},${cy + outerRadius * Math.sin(-midAngle * RADIAN)} ${ex},${ey} ${isRight ? ex + 12 : ex - 12},${ey}`}
        fill="none"
        stroke="#9ca3af"
        strokeWidth={1}
      />
      <text
        x={isRight ? ex + 15 : ex - 15}
        y={ey - 4}
        fill="#57534e"
        textAnchor={isRight ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-bold text-[11px] dark:fill-gray-200"
      >
        {name}
      </text>
      <text
        x={isRight ? ex + 15 : ex - 15}
        y={ey + 8}
        fill="#44403c"
        textAnchor={isRight ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-black text-[11px] dark:fill-white"
      >
        {pctStr}
      </text>
    </g>
  );
};

// Custom Outside Label for Income Pie Chart
const renderIncomePieLabel = (props: any) => {
  const { cx, cy, midAngle, outerRadius, name, value, fill } = props;
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 22;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const isRight = x > cx;

  return (
    <g>
      <text
        x={x}
        y={y - 6}
        fill={fill}
        textAnchor={isRight ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-black text-[11.5px] tracking-tight"
      >
        {name}
      </text>
      <text
        x={x}
        y={y + 7}
        fill={fill}
        textAnchor={isRight ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-extrabold text-[11px]"
      >
        ₹{Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </text>
    </g>
  );
};

// Custom Inside Label for Balance vs Expenditure Pie Chart
const renderInsidePieLabel = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, name, value } = props;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.52;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const isBalance = name.toLowerCase().includes('balance');
  const posY = isBalance ? y - 4 : y;

  return (
    <g>
      <text
        x={x}
        y={posY - 6}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-black text-[11px] drop-shadow-sm tracking-tight"
      >
        {name}
      </text>
      <text
        x={x}
        y={posY + 7}
        fill="#ffffff"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-extrabold text-[11px] drop-shadow-sm"
      >
        ₹{Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </text>
    </g>
  );
};

export default function FinanceHubPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'budget' | 'transactions' | 'income' | 'investment'>('budget');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [showAllCharts, setShowAllCharts] = useState(false);

  // Modals state
  const [modalType, setModalType] = useState<'expense' | 'income' | 'investment' | 'budget' | null>(null);
  const [editingEntry, setEditingEntry] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Import / Export state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [parsedImportData, setParsedImportData] = useState<{ entries: any[]; summary: any } | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    description: '',
    category: '',
    amount: '',
    budgetLimit: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI / QR',
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getFinanceData();
      setEntries(data);
    } catch (err) {
      console.error('Failed to load finance data:', err);
      toast.error('Failed to load financial records');
    } finally {
      setLoading(false);
    }
  };

  // Safe Date parsing helper to prevent timezone shifts across UTC/Local
  const getEntryDateInfo = (dateVal: any) => {
    if (!dateVal) return null;
    if (typeof dateVal === 'string' && dateVal.includes('-')) {
      const cleanStr = dateVal.split('T')[0];
      const parts = cleanStr.split('-');
      if (parts.length >= 3) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1; // 0-indexed month
        if (!isNaN(y) && !isNaN(m)) {
          return { year: y, month: m };
        }
      }
    }
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return null;
    return { year: d.getFullYear(), month: d.getMonth() };
  };

  // Compute available unique years from records + current year + 2024
  const availableYears = useMemo(() => {
    const yearsSet = new Set<string>();
    const currentYear = new Date().getFullYear();
    yearsSet.add(String(currentYear));
    yearsSet.add('2024');
    entries.forEach(e => {
      if (e.date) {
        const info = getEntryDateInfo(e.date);
        if (info && !isNaN(info.year)) yearsSet.add(String(info.year));
      }
    });
    return Array.from(yearsSet).sort((a, b) => Number(b) - Number(a));
  }, [entries]);

  // Filter entries based on selected Month & Year
  const filteredByDateEntries = useMemo(() => {
    return entries.filter(e => {
      if (e.type === 'budget') return true;
      if (!e.date) return true;
      const info = getEntryDateInfo(e.date);
      if (!info) return true;

      const matchMonth = selectedMonth === 'all' || info.month === parseInt(selectedMonth, 10);
      const matchYear = selectedYear === 'all' || String(info.year) === selectedYear;
      return matchMonth && matchYear;
    });
  }, [entries, selectedMonth, selectedYear]);

  // Separate records by type using filtered date entries
  const incomes = useMemo(() => filteredByDateEntries.filter(e => e.type === 'income'), [filteredByDateEntries]);
  const expenses = useMemo(() => filteredByDateEntries.filter(e => e.type === 'expense'), [filteredByDateEntries]);
  const investments = useMemo(() => filteredByDateEntries.filter(e => e.type === 'investment'), [filteredByDateEntries]);
  const budgets = useMemo(() => entries.filter(e => e.type === 'budget'), [entries]);

  // Aggregate metrics
  const totalIncome = useMemo(() => incomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0), [incomes]);
  const totalExpense = useMemo(() => expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0), [expenses]);
  const totalInvestment = useMemo(() => investments.reduce((sum, item) => sum + (Number(item.amount) || 0), 0), [investments]);
  const totalPlannedBudget = useMemo(() => budgets.reduce((sum, item) => sum + (Number(item.budgetLimit) || 0), 0), [budgets]);
  const netBalance = totalIncome - totalExpense - totalInvestment;
  const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) : '0';
  const burnRate = totalPlannedBudget > 0 ? ((totalExpense / totalPlannedBudget) * 100).toFixed(1) : '0';
  const outflowPct = totalIncome > 0 ? Math.min(100, Math.max(0, (totalExpense / totalIncome) * 100)).toFixed(1) : totalExpense > 0 ? '100' : '0';
  const surplusPct = totalIncome > 0 ? Math.max(0, (netBalance / totalIncome) * 100).toFixed(1) : '0';

  const ORDERED_BUDGET_CATEGORIES = [
    'Family',
    'Fashion',
    'Phone Electricity',
    'Medical',
    'Travel',
    'Others',
    'Party & Feast',
    'Sweets & Tifin',
    'Things',
    'Investment'
  ];

  // Budget vs Actual calculations by category
  const budgetSummary = useMemo(() => {
    const map = new Map<string, { category: string; budget: number; actual: number }>();

    ORDERED_BUDGET_CATEGORIES.forEach(cat => {
      const bObj = budgets.find(b => b.category.toLowerCase() === cat.toLowerCase());
      map.set(cat, {
        category: cat,
        budget: bObj ? Number(bObj.budgetLimit) || 0 : 0,
        actual: 0
      });
    });

    budgets.forEach(b => {
      if (!map.has(b.category)) {
        map.set(b.category, {
          category: b.category,
          budget: Number(b.budgetLimit) || 0,
          actual: 0
        });
      }
    });

    expenses.forEach(e => {
      const existing = map.get(e.category);
      if (existing) {
        existing.actual += Number(e.amount) || 0;
      } else {
        map.set(e.category, {
          category: e.category,
          budget: 0,
          actual: Number(e.amount) || 0
        });
      }
    });

    return Array.from(map.values()).map(item => {
      const difference = item.budget - item.actual;
      const pct = item.budget > 0 ? (item.actual / item.budget) * 100 : item.actual > 0 ? 100 : 0;
      return {
        ...item,
        difference,
        percentUsed: pct,
        isOverBudget: item.budget > 0 && item.actual > item.budget
      };
    });
  }, [budgets, expenses]);

  // Compute dynamic max deficit category
  const maxDeficitCategory = useMemo(() => {
    const over = budgetSummary.filter(b => b.actual > b.budget && b.budget > 0);
    if (over.length === 0) {
      const topSpend = [...budgetSummary].sort((a, b) => b.actual - a.actual)[0];
      return topSpend && topSpend.actual > 0 
        ? { name: topSpend.category, pct: topSpend.budget > 0 ? Math.round((topSpend.actual / topSpend.budget) * 100) : 100 }
        : { name: 'None (Balanced)', pct: 0 };
    }
    const worst = [...over].sort((a, b) => (b.actual - b.budget) - (a.actual - a.budget))[0];
    return { name: worst.category, pct: Math.round((worst.actual / worst.budget) * 100) };
  }, [budgetSummary]);

  // 1. Income Pie Data
  const incomePieData = useMemo(() => {
    const map: { [k: string]: number } = {};
    incomes.forEach(i => {
      map[i.category] = (map[i.category] || 0) + (Number(i.amount) || 0);
    });
    return Object.entries(map).map(([name, value]) => {
      let color = NUMBERS_COLORS.cryptoGreen;
      if (name.toLowerCase().includes('graphic') || name.toLowerCase().includes('design')) {
        color = NUMBERS_COLORS.designBlue;
      } else if (name.toLowerCase().includes('crypto')) {
        color = NUMBERS_COLORS.cryptoGreen;
      } else {
        color = '#f59e0b';
      }
      return { name, value, fill: color };
    });
  }, [incomes]);

  // 2. Actual Summary Donut Data
  const actualSummaryDonutData = useMemo(() => {
    const map: { [k: string]: number } = {};
    expenses.forEach(e => {
      map[e.category] = (map[e.category] || 0) + (Number(e.amount) || 0);
    });

    const categoryColors: { [k: string]: string } = {
      'Things': NUMBERS_COLORS.thingsGreen,
      'Others': NUMBERS_COLORS.othersBrown,
      'Travel': NUMBERS_COLORS.travelOrange,
      'Family': NUMBERS_COLORS.familyRust,
    };

    return Object.entries(map).map(([name, value]) => ({
      name,
      value,
      fill: categoryColors[name] || '#8c7d6c'
    })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  // 3. Budget vs Actual Grouped Bar Data
  const budgetVsActualNumbersData = useMemo(() => {
    return budgetSummary.map(b => ({
      category: b.category,
      Budget: b.budget,
      Actual: b.actual
    }));
  }, [budgetSummary]);

  // 4. Money Flow Balance vs Expenditure Pie
  const balanceVsExpenditurePieData = useMemo(() => {
    return [
      {
        name: 'Expenditure',
        value: totalExpense,
        fill: NUMBERS_COLORS.expenditureGray
      },
      {
        name: 'Balance',
        value: Math.max(0, netBalance),
        fill: NUMBERS_COLORS.balanceGreen
      }
    ];
  }, [totalExpense, netBalance]);

  // 5. Daily Cumulative Timeline Data for Smooth Area Chart
  const timelineData = useMemo(() => {
    const map: { [key: string]: { date: string; displayDate: string; income: number; expense: number } } = {};
    
    filteredByDateEntries.forEach(e => {
      if (e.type === 'budget') return;
      const d = e.date ? new Date(e.date) : new Date();
      const key = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      if (!map[key]) {
        map[key] = { date: key, displayDate, income: 0, expense: 0 };
      }
      if (e.type === 'income') map[key].income += Number(e.amount) || 0;
      if (e.type === 'expense') map[key].expense += Number(e.amount) || 0;
    });

    const sorted = Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
    let runningBalance = 0;
    let runningIncome = 0;
    let runningExpense = 0;

    return sorted.map(item => {
      runningIncome += item.income;
      runningExpense += item.expense;
      runningBalance = runningIncome - runningExpense;
      return {
        ...item,
        cumIncome: runningIncome,
        cumExpense: runningExpense,
        balance: runningBalance
      };
    });
  }, [filteredByDateEntries]);

  // 6. Payment & Settlement Methods Breakdown
  const paymentMethodData = useMemo(() => {
    const map: { [method: string]: { name: string; value: number; count: number } } = {};
    
    [...expenses, ...incomes, ...investments].forEach(entry => {
      const method = entry.paymentMethod || 'UPI / QR';
      if (!map[method]) {
        map[method] = { name: method, value: 0, count: 0 };
      }
      map[method].value += Number(entry.amount) || 0;
      map[method].count += 1;
    });

    const colors: { [k: string]: string } = {
      'UPI / QR': '#6366f1',
      'Cash': '#10b981',
      'Bank Transfer (IMPS/NEFT)': '#3b82f6',
      'Credit Card': '#f59e0b',
      'Crypto Wallet': '#8b5cf6',
      'Cheque': '#ec4899',
    };

    const results = Object.values(map).map(item => ({
      ...item,
      fill: colors[item.name] || '#64748b'
    })).sort((a, b) => b.value - a.value);

    if (results.length === 0) {
      return [{ name: 'UPI / QR', value: 1, count: 1, fill: '#6366f1' }];
    }
    return results;
  }, [expenses, incomes, investments]);

  // Total Transaction Volume across all payment methods
  const totalVolume = useMemo(() => {
    return paymentMethodData.reduce((acc, curr) => acc + curr.value, 0);
  }, [paymentMethodData]);

  // 7. Investment Portfolio Breakdown Data
  const investmentPortfolioData = useMemo(() => {
    const map: { [cat: string]: number } = {};
    investments.forEach(inv => {
      map[inv.category] = (map[inv.category] || 0) + (Number(inv.amount) || 0);
    });

    const colors: { [k: string]: string } = {
      'Crypto Portfolio': '#8b5cf6',
      'Mutual Funds & SIP': '#3b82f6',
      'Share Market / Stocks': '#10b981',
      'Camera & Studio Gear': '#f59e0b',
      'Gold / Precious Metals': '#eab308',
      'Real Estate & Land': '#ec4899',
      'Fixed Deposit': '#06b6d4',
    };

    // If no investments logged yet, show planned target preview
    if (Object.keys(map).length === 0) {
      return [
        { name: 'Crypto Portfolio', value: 1000, fill: '#8b5cf6' },
        { name: 'Mutual Funds & SIP', value: 800, fill: '#3b82f6' },
        { name: 'Camera & Gear', value: 700, fill: '#f59e0b' },
      ];
    }

    return Object.entries(map).map(([name, value], idx) => ({
      name,
      value,
      fill: colors[name] || '#a855f7'
    })).sort((a, b) => b.value - a.value);
  }, [investments]);

  // 8. Category Budget Variance & Delta Data (Surplus vs Deficit)
  const categoryVarianceData = useMemo(() => {
    return budgetSummary
      .filter(item => item.budget > 0 || item.actual > 0)
      .map(item => {
        const variance = item.budget - item.actual;
        return {
          category: item.category,
          budget: item.budget,
          actual: item.actual,
          variance: variance,
          isSurplus: variance >= 0,
          fill: variance >= 0 ? '#10b981' : '#e50914'
        };
      })
      .sort((a, b) => a.variance - b.variance);
  }, [budgetSummary]);

  // Modal open helpers
  const openAddModal = (type: 'expense' | 'income' | 'investment' | 'budget') => {
    setModalType(type);
    setEditingEntry(null);

    // If month/year filter is active, preset date to that month
    const now = new Date();
    const yr = selectedYear !== 'all' ? parseInt(selectedYear, 10) : now.getFullYear();
    const mo = selectedMonth !== 'all' ? parseInt(selectedMonth, 10) : now.getMonth();
    const day = (yr === now.getFullYear() && mo === now.getMonth()) ? now.getDate() : 1;
    const pad = (n: number) => String(n).padStart(2, '0');
    const defaultDate = `${yr}-${pad(mo + 1)}-${pad(day)}`;

    setFormData({
      description: '',
      category: type === 'expense' ? 'Things' : type === 'income' ? 'Graphic & Design' : type === 'investment' ? 'Crypto Portfolio' : 'Family',
      amount: '',
      budgetLimit: '',
      date: defaultDate,
      paymentMethod: 'UPI / QR',
      notes: ''
    });
  };

  const openEditModal = (entry: any) => {
    setEditingEntry(entry);
    setModalType(entry.type);
    setFormData({
      description: entry.description || '',
      category: entry.category || '',
      amount: entry.amount ? String(entry.amount) : '',
      budgetLimit: entry.budgetLimit ? String(entry.budgetLimit) : '',
      date: entry.date ? new Date(entry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      paymentMethod: entry.paymentMethod || 'UPI / QR',
      notes: entry.notes || ''
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category.trim()) {
      toast.error('Category is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEntry) {
        const updated = await updateFinanceEntry(editingEntry._id || editingEntry.id, {
          category: formData.category,
          description: formData.description,
          amount: parseFloat(formData.amount) || 0,
          budgetLimit: parseFloat(formData.budgetLimit) || 0,
          date: formData.date,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes
        });
        setEntries(prev => prev.map(item => (item._id || item.id) === (editingEntry._id || editingEntry.id) ? updated : item));
        toast.success('Record updated successfully');
      } else {
        if (modalType === 'budget') {
          const updated = await updateBudgetCategory(formData.category, parseFloat(formData.budgetLimit) || 0);
          setEntries(prev => {
            const filtered = prev.filter(p => !(p.type === 'budget' && p.category.toLowerCase() === formData.category.toLowerCase()));
            return [...filtered, updated];
          });
          toast.success(`Budget for "${formData.category}" saved`);
        } else {
          const created = await createFinanceEntry({
            type: modalType as any,
            category: formData.category,
            description: formData.description,
            amount: parseFloat(formData.amount) || 0,
            date: formData.date,
            paymentMethod: formData.paymentMethod,
            notes: formData.notes
          });
          setEntries(prev => [created, ...prev]);
          toast.success(`${modalType === 'expense' ? 'Expense' : modalType === 'income' ? 'Income' : 'Investment'} entry added`);
        }
      }
      setModalType(null);
    } catch (err) {
      console.error('Failed to save record:', err);
      toast.error('Failed to save record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteFinanceEntry(id);
      setEntries(prev => prev.filter(item => (item._id || item.id) !== id));
      toast.success('Record deleted');
    } catch (err) {
      console.error('Failed to delete:', err);
      toast.error('Failed to delete record');
    }
  };

  const handleResetData = async () => {
    if (!confirm('Reset all financial records back to "NEVER GIVE UP 2023" initial dataset?')) return;
    setLoading(true);
    try {
      await resetToDefaultFinanceData();
      await loadData();
      toast.success('Dataset restored to NEVER GIVE UP 2023 baseline');
    } catch (err) {
      console.error('Failed to reset:', err);
      toast.error('Failed to reset records');
    } finally {
      setLoading(false);
    }
  };

  const handlePopulateSampleData = async () => {
    const now = new Date();
    const targetYear = selectedYear !== 'all' ? parseInt(selectedYear, 10) : now.getFullYear();
    const targetMonth = selectedMonth !== 'all' ? parseInt(selectedMonth, 10) : (selectedYear === '2024' ? 4 : now.getMonth());

    setIsSubmitting(true);
    try {
      await populateSampleMonthData(targetYear, targetMonth);
      const monthLabel = MONTH_OPTIONS.find(m => m.value === String(targetMonth))?.label || 'Selected Month';
      toast.success(`Populated template records for ${monthLabel} ${targetYear}!`);
      await loadData();
    } catch (err) {
      console.error('Failed to populate sample data:', err);
      toast.error('Failed to populate sample data');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file selection for import
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFile(file);
    try {
      const parsed = await parseImportFile(file);
      setParsedImportData(parsed);
      toast.success(`Parsed ${parsed.entries.length} records from ${file.name}`);
    } catch (err) {
      console.error('Failed to parse file:', err);
      toast.error('Could not parse file. Ensure it is a valid .xlsx or .csv sheet.');
    }
  };

  const handleImportSubmit = async () => {
    if (!parsedImportData || parsedImportData.entries.length === 0) {
      toast.error('No valid records to import');
      return;
    }

    setIsImporting(true);
    try {
      const result = await importBatchFinanceEntries(parsedImportData.entries, importMode);
      toast.success(`Successfully imported ${result.count} records!`);
      setIsImportModalOpen(false);
      setImportFile(null);
      setParsedImportData(null);
      await loadData();
    } catch (err) {
      console.error('Import failed:', err);
      toast.error('Failed to import financial records');
    } finally {
      setIsImporting(false);
    }
  };

  // Filtered lists for each tab
  const filteredExpenses = useMemo(() => {
    return expenses.filter(item => {
      const matchQuery = !searchQuery || item.description?.toLowerCase().includes(searchQuery.toLowerCase()) || item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      return matchQuery && matchCat;
    });
  }, [expenses, searchQuery, categoryFilter]);

  const filteredIncomes = useMemo(() => {
    return incomes.filter(item => {
      const matchQuery = !searchQuery || item.description?.toLowerCase().includes(searchQuery.toLowerCase()) || item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      return matchQuery && matchCat;
    });
  }, [incomes, searchQuery, categoryFilter]);

  const filteredInvestments = useMemo(() => {
    return investments.filter(item => {
      const matchQuery = !searchQuery || item.description?.toLowerCase().includes(searchQuery.toLowerCase()) || item.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = categoryFilter === 'all' || item.category === categoryFilter;
      return matchQuery && matchCat;
    });
  }, [investments, searchQuery, categoryFilter]);

  return (
    <div className="w-full space-y-6 pb-20 font-sans text-gray-800 dark:text-gray-100">
      
      {/* Header Banner */}
      <div className="relative z-40 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 dark:bg-[#14161c]/90 backdrop-blur-xl p-6 rounded-3xl border border-red-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#e50914] to-red-700 text-white flex items-center justify-center shadow-lg shadow-red-500/25 ring-4 ring-red-500/10">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                Financial Hub & Analytics
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-red-100 text-[#e50914] dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900 flex items-center gap-1 shadow-2xs">
                <Sparkles className="w-3 h-3" />
                Never Give Up
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              3 Charts per Row • Multi-Category Budget Planner, Cashflow Trend & Sheet Sync
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Import Sheet Button */}
          <button
            onClick={() => {
              setImportFile(null);
              setParsedImportData(null);
              setIsImportModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
            title="Import Excel / CSV Sheet"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Export Sheet Options"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>

            {isExportMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsExportMenuOpen(false)} 
                />
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-800 rounded-2xl p-2 shadow-2xl z-50 animate-fade-in"
                  onClick={() => setIsExportMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      exportToExcelWorkbook(entries);
                      toast.success('Exported full NEVER GIVE UP 4-sheet Excel workbook!');
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-[#e50914] rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Full Workbook (.xlsx)</span>
                  </button>
                  <button
                    onClick={() => {
                      exportSingleSectionCSV(activeTab, entries);
                      toast.success(`Exported ${activeTab} CSV!`);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-blue-500" />
                    <span>Current Tab CSV</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Consolidated Add Entry Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#e50914] to-red-700 hover:from-red-600 hover:to-red-800 text-white text-xs font-black rounded-xl shadow-md shadow-red-500/25 transition-all cursor-pointer ring-1 ring-red-500/30"
              title="Add New Financial Entry"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Entry</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isAddMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {isAddMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsAddMenuOpen(false)} 
                />
                <div 
                  className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#1c1f26] border border-gray-200 dark:border-gray-800 rounded-2xl p-2 shadow-2xl z-50 animate-fade-in divide-y divide-gray-100 dark:divide-gray-800/60"
                >
                  <div className="p-1 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block mb-1 px-2 pt-1">
                      Choose Entry Type
                    </span>

                    {/* Add Expense Option */}
                    <button
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        openAddModal('expense');
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                          <TrendingDown className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-[#e50914]">
                            Add Expense
                          </div>
                          <div className="text-[10px] text-gray-400">
                            Outflow / payment transaction
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60">
                        Outflow
                      </span>
                    </button>

                    {/* Add Income Option */}
                    <button
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        openAddModal('income');
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-emerald-600">
                            Add Income
                          </div>
                          <div className="text-[10px] text-gray-400">
                            Revenue, Crypto or Design pay
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/60">
                        Inflow
                      </span>
                    </button>

                    {/* Add Investment Option */}
                    <button
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        openAddModal('investment');
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                          <PiggyBank className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-purple-600">
                            Add Investment
                          </div>
                          <div className="text-[10px] text-gray-400">
                            Stocks, SIP, Crypto, Gear & Gold
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-900/60">
                        Wealth
                      </span>
                    </button>
                  </div>

                  {/* Set Budget Option */}
                  <div className="p-1 pt-1.5">
                    <button
                      onClick={() => {
                        setIsAddMenuOpen(false);
                        openAddModal('budget');
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center shadow-xs">
                          <Scale className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-amber-600">
                            Set Category Budget
                          </div>
                          <div className="text-[10px] text-gray-400">
                            Adjust monthly category limit
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/60">
                        Planner
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleResetData}
            title="Reset to NEVER GIVE UP 2023 Default"
            className="p-2.5 text-gray-500 hover:text-gray-800 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 🗓️ Period & Date Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 bg-white/80 dark:bg-[#14161c]/90 backdrop-blur-xl px-5 py-3.5 rounded-2xl border border-red-100/60 dark:border-gray-800 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 text-xs font-black text-gray-800 dark:text-gray-200 mr-1">
            <div className="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#e50914] flex items-center justify-center shadow-2xs">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <span>Time Filter:</span>
          </div>

          {/* Month Dropdown */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="appearance-none bg-gray-50 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-gray-800 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer transition-all shadow-2xs"
            >
              {MONTH_OPTIONS.map(m => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Year Dropdown */}
          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="appearance-none bg-gray-50 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2 pr-8 text-xs font-bold text-gray-800 dark:text-gray-100 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer transition-all shadow-2xs"
            >
              <option value="all">All Years</option>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>
                  {yr}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Filter Presets */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-gray-200 dark:border-gray-800">
            <button
              onClick={() => { setSelectedMonth('all'); setSelectedYear('all'); }}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                selectedMonth === 'all' && selectedYear === 'all'
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All Time
            </button>

            <button
              onClick={() => {
                const now = new Date();
                setSelectedMonth(String(now.getMonth()));
                setSelectedYear(String(now.getFullYear()));
              }}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                selectedMonth === String(new Date().getMonth()) && selectedYear === String(new Date().getFullYear())
                  ? 'bg-[#e50914] text-white shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              This Month
            </button>

            <button
              onClick={() => { setSelectedMonth('4'); setSelectedYear('2024'); }}
              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                selectedMonth === '4' && selectedYear === '2024'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              May 2024 (Sheet)
            </button>
          </div>
        </div>

        {/* Filter Summary Badge */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            Active Period:
          </span>
          <span className="font-extrabold text-[#e50914] bg-red-50 dark:bg-red-950/40 px-2.5 py-1 rounded-xl border border-red-200/80 dark:border-red-900/60 flex items-center gap-1.5 shadow-2xs">
            <span>
              {selectedMonth === 'all' && selectedYear === 'all' 
                ? 'All Time' 
                : `${selectedMonth !== 'all' ? MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label : 'All Months'} ${selectedYear !== 'all' ? selectedYear : ''}`}
            </span>
            <span className="text-[10px] bg-[#e50914] text-white px-1.5 py-0.2 rounded-full font-black">
              {filteredByDateEntries.filter(e => e.type !== 'budget').length} txns
            </span>
          </span>

          {(selectedMonth !== 'all' || selectedYear !== 'all') && (
            <button
              onClick={() => { setSelectedMonth('all'); setSelectedYear('all'); }}
              className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title="Reset Period Filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Empty Period Helper Notification Banner */}
      {filteredByDateEntries.filter(e => e.type !== 'budget').length === 0 && (
        <div className="relative z-20 w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 p-4 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-500/15 dark:via-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-900 dark:text-amber-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <p className="font-extrabold text-xs text-gray-900 dark:text-gray-100">
                No entries logged for {selectedMonth !== 'all' ? MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label : 'this period'} {selectedYear !== 'all' ? selectedYear : ''}
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                The financial charts display transactions logged for this selected period. Load sample data or add entries to see live charts.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={handlePopulateSampleData}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-[11px] shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Populate Sample Data</span>
            </button>
            <button
              onClick={() => { setSelectedMonth('4'); setSelectedYear('2024'); }}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-700 font-bold text-[11px] border border-gray-200 dark:border-gray-700 transition-all cursor-pointer shadow-2xs"
            >
              View May 2024 (Sheet)
            </button>
          </div>
        </div>
      )}

      {/* SVG Linear Gradients Definition */}
      <svg width="0" height="0" className="hidden">
        <defs>
          <linearGradient id="areaIncomeFlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.45} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="areaExpenseFlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#e50914" stopOpacity={0.45} />
            <stop offset="95%" stopColor="#e50914" stopOpacity={0.0} />
          </linearGradient>
          <linearGradient id="areaBalanceFlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.45} />
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
          </linearGradient>
        </defs>
      </svg>

      {/* ========================================================= */}
      {/* 📊 3 CHARTS PER ROW GRID (6 CHARTS TOTAL)                */}
      {/* ========================================================= */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* ── ROW 1 / CHART 1: INCOME BREAKDOWN (Apple Numbers Pie) ── */}
        <div className="p-5 bg-white dark:bg-[#16181f] rounded-3xl border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col items-center justify-between min-h-[340px]">
          <div className="w-full flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300">
              INCOME BREAKDOWN
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="w-full h-[250px] flex items-center justify-center">
            {totalIncome > 0 && incomePieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={incomePieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={renderIncomePieLabel}
                    labelLine={false}
                  >
                    {incomePieData.map((entry, index) => (
                      <Cell 
                        key={`grid-inc-${index}`} 
                        fill={entry.fill} 
                        stroke="#ffffff" 
                        strokeWidth={2} 
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-2 shadow-2xs">
                  <ArrowUpRight className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">No Income in this Period</p>
                <p className="text-[10px] text-gray-400 mt-0.5 mb-3">No revenue transactions logged</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAddModal('income')}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-[11px] font-black shadow-xs cursor-pointer flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Income</span>
                  </button>
                  <button
                    onClick={handlePopulateSampleData}
                    disabled={isSubmitting}
                    className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold cursor-pointer flex items-center gap-1 transition-all"
                    title="Populate sample income entries for this month"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Sample Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-full flex justify-between text-[11px] text-gray-500 border-t border-gray-100 dark:border-gray-800/60 pt-2 font-medium">
            {totalIncome > 0 && incomePieData.length > 0 ? (
              <>
                {incomePieData.slice(0, 2).map((item, idx) => (
                  <span key={idx}>{item.name.split(' ')[0]}: <strong style={{ color: item.fill }}>{((item.value / totalIncome) * 100).toFixed(1)}%</strong></span>
                ))}
                {incomePieData.length > 2 && (
                  <span className="text-gray-400">+{incomePieData.length - 2} more</span>
                )}
              </>
            ) : (
              <>
                <span className="text-gray-400">No revenue streams active</span>
                <span className="text-gray-400 font-bold">₹0.00</span>
              </>
            )}
          </div>
        </div>

        {/* ── ROW 1 / CHART 2: ACTUAL SUMMARY (Apple Numbers Donut Ring) ── */}
        <div className="p-5 bg-white dark:bg-[#16181f] rounded-3xl border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col items-center justify-between min-h-[340px]">
          <div className="w-full flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300">
              ACTUAL SUMMARY
            </span>
            <span className="text-[10px] font-bold text-red-600 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
              ₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="w-full h-[250px] flex items-center justify-center">
            {totalExpense > 0 && actualSummaryDonutData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={actualSummaryDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={1}
                    dataKey="value"
                    label={renderCustomDonutLabel}
                    labelLine={false}
                  >
                    {actualSummaryDonutData.map((entry, index) => (
                      <Cell 
                        key={`grid-donut-${index}`} 
                        fill={entry.fill} 
                        stroke="#ffffff" 
                        strokeWidth={1.5} 
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#e50914] flex items-center justify-center mb-2 shadow-2xs">
                  <CreditCard className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">No Expenses in this Period</p>
                <p className="text-[10px] text-gray-400 mt-0.5 mb-3">Zero outflow spending recorded</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAddModal('expense')}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white text-[11px] font-black shadow-xs cursor-pointer flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Expense</span>
                  </button>
                  <button
                    onClick={handlePopulateSampleData}
                    disabled={isSubmitting}
                    className="px-2.5 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900 border border-rose-200 dark:border-rose-800 text-[11px] font-bold cursor-pointer flex items-center gap-1 transition-all"
                    title="Populate sample expense entries for this month"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Sample Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-full flex justify-between text-[11px] text-gray-500 border-t border-gray-100 dark:border-gray-800/60 pt-2 font-medium">
            {totalExpense > 0 && actualSummaryDonutData.length > 0 ? (
              <>
                {actualSummaryDonutData.slice(0, 3).map((item, idx) => (
                  <span key={idx}>{item.name}: <strong style={{ color: item.fill }}>{((item.value / totalExpense) * 100).toFixed(0)}%</strong></span>
                ))}
              </>
            ) : (
              <>
                <span className="text-gray-400">Zero outflow</span>
                <span className="text-emerald-600 font-bold">100% Budget Intact</span>
              </>
            )}
          </div>
        </div>

        {/* ── ROW 1 / CHART 3: EXPENDITURE VS. BALANCE (Apple Numbers Pie) ── */}
        <div className="p-5 bg-white dark:bg-[#16181f] rounded-3xl border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col items-center justify-between min-h-[340px]">
          <div className="w-full flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300">
              EXPENDITURE VS. BALANCE
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              netBalance >= 0 
                ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800'
                : 'text-red-600 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800'
            }`}>
              {totalIncome > 0 ? `${savingsRate}% Saved` : '0% Activity'}
            </span>
          </div>

          <div className="w-full h-[250px] flex items-center justify-center">
            {(totalIncome > 0 || totalExpense > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={balanceVsExpenditurePieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={92}
                    dataKey="value"
                    label={renderInsidePieLabel}
                    labelLine={false}
                  >
                    {balanceVsExpenditurePieData.map((entry, index) => (
                      <Cell 
                        key={`grid-bal-${index}`} 
                        fill={entry.fill} 
                        stroke="#ffffff" 
                        strokeWidth={1.5} 
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-2 shadow-2xs">
                  <Scale className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">No Cashflow in this Period</p>
                <p className="text-[10px] text-gray-400 mt-0.5 mb-3">No income or expense activity</p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddMenuOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-[11px] font-black shadow-xs cursor-pointer flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Entry</span>
                  </button>
                  <button
                    onClick={handlePopulateSampleData}
                    disabled={isSubmitting}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 text-[11px] font-bold cursor-pointer flex items-center gap-1 transition-all"
                    title="Populate sample entries for this month"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Sample Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="w-full flex justify-between text-[11px] text-gray-500 border-t border-gray-100 dark:border-gray-800/60 pt-2 font-medium">
            <span>Spent: <strong>₹{totalExpense.toLocaleString()}</strong></span>
            <span>Surplus: <strong className={netBalance >= 0 ? "text-emerald-600" : "text-[#e50914]"}>{netBalance >= 0 ? '+' : ''}₹{netBalance.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* ── ROW 2 / CHART 4: BUDGET VS. ACTUAL (Apple Numbers Grouped Columns) ── */}
        <div className="p-5 bg-white dark:bg-[#16181f] rounded-3xl border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col items-center justify-between min-h-[340px]">
          <div className="w-full flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300">
              BUDGET VS. ACTUAL
            </span>
            <span className="text-[10px] font-bold text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full">
              {budgetSummary.length} Categories
            </span>
          </div>

          <div className="w-full h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={budgetVsActualNumbersData}
                margin={{ top: 10, right: 5, left: -10, bottom: 45 }}
                barGap={2}
              >
                <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#d6d3d160" />
                <XAxis
                  dataKey="category"
                  stroke="#78716c"
                  fontSize={9.5}
                  tickLine={false}
                  angle={-90}
                  textAnchor="end"
                  interval={0}
                  dy={5}
                />
                <YAxis
                  stroke="#78716c"
                  fontSize={9.5}
                  tickLine={false}
                  tickFormatter={(v) => `₹${v}`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#181a20', borderRadius: '12px', color: '#fff', fontSize: '11px', border: '1px solid #333' }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  iconType="square"
                  wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="Budget" fill={NUMBERS_COLORS.budgetYellow} radius={[2, 2, 0, 0]} maxBarSize={11} />
                <Bar dataKey="Actual" fill={NUMBERS_COLORS.actualTaupe} radius={[2, 2, 0, 0]} maxBarSize={11} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full flex justify-between text-[11px] text-gray-500 border-t border-gray-100 dark:border-gray-800/60 pt-2 font-medium">
            <span>Total Budget: <strong>₹{totalPlannedBudget.toLocaleString()}</strong></span>
            <span>Spent: <strong className="text-[#e50914]">₹{totalExpense.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* ── ROW 2 / CHART 5: DAILY CASHFLOW & LIQUIDITY TREND (Area Stream) ── */}
        <div className="p-5 bg-white dark:bg-[#16181f] rounded-3xl border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col items-center justify-between min-h-[340px]">
          <div className="w-full flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              CASHFLOW & LIQUIDITY TREND
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              Timeline Area
            </span>
          </div>

          <div className="w-full h-[240px] flex items-center justify-center">
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888815" />
                  <XAxis dataKey="displayDate" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                    contentStyle={{ backgroundColor: '#181a20', borderRadius: '12px', color: '#fff', fontSize: '11px', border: '1px solid #333' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }} />
                  <Area
                    type="monotone"
                    dataKey="cumIncome"
                    name="Inflow (Cum)"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#areaIncomeFlow)"
                  />
                  <Area
                    type="monotone"
                    dataKey="cumExpense"
                    name="Outflow (Cum)"
                    stroke="#e50914"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#areaExpenseFlow)"
                  />
                  <Area
                    type="monotone"
                    dataKey="balance"
                    name="Balance (Net)"
                    stroke="#0ea5e9"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    fillOpacity={1}
                    fill="url(#areaBalanceFlow)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-2 shadow-2xs">
                  <Activity className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-gray-700 dark:text-gray-200">No Timeline Data</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Transactions will draw the daily curve</p>
              </div>
            )}
          </div>

          <div className="w-full flex justify-between text-[11px] text-gray-500 border-t border-gray-100 dark:border-gray-800/60 pt-2 font-medium">
            <span>{selectedMonth !== 'all' ? MONTH_OPTIONS.find(m => m.value === selectedMonth)?.label : 'All Time'} Timeline</span>
            <span className={netBalance >= 0 ? "text-emerald-600 font-bold" : "text-[#e50914] font-bold"}>
              {netBalance >= 0 ? 'Positive Trajectory' : 'Deficit Trajectory'}
            </span>
          </div>
        </div>

        {/* ── ROW 2 / CHART 6: FINANCIAL HEALTH & SAVINGS EFFICIENCY ── */}
        <div className="p-5 bg-white dark:bg-[#16181f] rounded-3xl border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col justify-between min-h-[340px]">
          <div className="w-full flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-2.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#e50914]" />
              HEALTH & BUDGET GAUGE
            </span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
              Status Score
            </span>
          </div>

          <div className="space-y-4 my-auto py-2">
            {/* Outflow vs Surplus Bar */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-gray-700 dark:text-gray-300">Revenue Utilization</span>
                <span className="text-[#e50914] font-extrabold">{outflowPct}% Outflow / {surplusPct}% Surplus</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden flex shadow-inner">
                <div className="bg-[#e50914] h-full rounded-l-full transition-all duration-500" style={{ width: `${outflowPct}%` }} title={`Outflow: ₹${totalExpense.toLocaleString()}`} />
                <div className="bg-emerald-500 h-full rounded-r-full transition-all duration-500" style={{ width: `${surplusPct}%` }} title={`Surplus: ₹${Math.max(0, netBalance).toLocaleString()}`} />
              </div>
            </div>

            {/* Overall Planned Budget Burn */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-gray-700 dark:text-gray-300">Overall Budget Burn</span>
                <span className="text-emerald-600 font-extrabold">{burnRate}% of ₹{totalPlannedBudget.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden flex shadow-inner">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, Number(burnRate))}%` }} />
              </div>
            </div>

            {/* Quick Summary Pill Cards */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50">
                <span className="text-[9px] uppercase font-bold text-emerald-600 block">Net Liquidity</span>
                <span className="font-extrabold text-xs text-gray-900 dark:text-white block mt-0.5">
                  {netBalance >= 0 ? '+' : ''}₹{netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
                <span className="text-[9px] text-gray-400">{netBalance >= 0 ? 'Positive Buffer' : 'Deficit Alert'}</span>
              </div>
              <div className="p-2.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/50">
                <span className="text-[9px] uppercase font-bold text-amber-600 block">Top Spend Focus</span>
                <span className="font-extrabold text-xs text-gray-900 dark:text-white block mt-0.5 truncate" title={maxDeficitCategory.name}>
                  {maxDeficitCategory.name}
                </span>
                <span className="text-[9px] text-gray-400">{maxDeficitCategory.pct}% of limit</span>
              </div>
            </div>
          </div>

          <div className="w-full flex justify-between text-[11px] text-gray-500 border-t border-gray-100 dark:border-gray-800/60 pt-2 font-medium">
            <span>Planned Target: <strong>₹{totalPlannedBudget.toLocaleString()}</strong></span>
            <span className="text-purple-600 font-bold">₹{totalInvestment.toLocaleString()} Invested</span>
          </div>
        </div>

        {/* ── ROW 3 (ADDITIONAL 3 IMPORTANT CHARTS - EXPANDABLE) ── */}
        {showAllCharts && (
          <>
            {/* ── ROW 3 / CHART 7: PAYMENT & SETTLEMENT CHANNELS (Donut Chart) ── */}
            <div className="p-5 bg-white dark:bg-[#16181f] rounded-3xl border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col items-center justify-between min-h-[340px] animate-fade-in">
              <div className="w-full flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-2.5">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                  PAYMENT CHANNELS MIX
                </span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                  ₹{totalVolume.toLocaleString('en-IN')} Flow
                </span>
              </div>

              <div className="w-full h-[240px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodData}
                      cx="50%"
                      cy="50%"
                      innerRadius={48}
                      outerRadius={72}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {paymentMethodData.map((entry, index) => (
                        <Cell 
                          key={`grid-pay-${index}`} 
                          fill={entry.fill} 
                          stroke="#ffffff" 
                          strokeWidth={1.5} 
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any) => [
                        `₹${Number(val).toLocaleString('en-IN')} (${totalVolume > 0 ? ((Number(val) / totalVolume) * 100).toFixed(1) : 0}%)`,
                        name
                      ]}
                      contentStyle={{ backgroundColor: '#181a20', borderRadius: '12px', color: '#fff', fontSize: '11px', border: '1px solid #333' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center" 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full flex justify-between text-[11px] text-gray-500 border-t border-gray-100 dark:border-gray-800/60 pt-2 font-medium">
                <span>Top Channel: <strong className="text-indigo-600 dark:text-indigo-400">{paymentMethodData[0]?.name || 'UPI'}</strong></span>
                <span>Txns: <strong>{entries.length} Total</strong></span>
              </div>
            </div>

            {/* ── ROW 3 / CHART 8: INVESTMENT & WEALTH PORTFOLIO (Donut / Pie) ── */}
            <div className="p-5 bg-white dark:bg-[#16181f] rounded-3xl border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col items-center justify-between min-h-[340px] animate-fade-in">
              <div className="w-full flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-2.5">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300 flex items-center gap-1.5">
                  <PiggyBank className="w-3.5 h-3.5 text-purple-500" />
                  INVESTMENT ASSET MIX
                </span>
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                  ₹{totalInvestment > 0 ? totalInvestment.toLocaleString('en-IN') : '2,500'} Target
                </span>
              </div>

              <div className="w-full h-[240px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={investmentPortfolioData}
                      cx="50%"
                      cy="50%"
                      outerRadius={72}
                      dataKey="value"
                      label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {investmentPortfolioData.map((entry, index) => (
                        <Cell 
                          key={`grid-inv-${index}`} 
                          fill={entry.fill} 
                          stroke="#ffffff" 
                          strokeWidth={1.5} 
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any) => [`₹${Number(val).toLocaleString('en-IN')}`, name]}
                      contentStyle={{ backgroundColor: '#181a20', borderRadius: '12px', color: '#fff', fontSize: '11px', border: '1px solid #333' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center" 
                      iconType="circle"
                      wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full flex justify-between text-[11px] text-gray-500 border-t border-gray-100 dark:border-gray-800/60 pt-2 font-medium">
                <span>Holdings: <strong>{investmentPortfolioData.length} Asset Classes</strong></span>
                <span className="text-purple-600 font-bold">SIP & Growth</span>
              </div>
            </div>

            {/* ── ROW 3 / CHART 9: BUDGET VARIANCE & SAVINGS DELTA (Bar Chart) ── */}
            <div className="p-5 bg-white dark:bg-[#16181f] rounded-3xl border border-gray-100 dark:border-gray-800/80 shadow-xs flex flex-col items-center justify-between min-h-[340px] animate-fade-in">
              <div className="w-full flex items-center justify-between border-b border-gray-100 dark:border-gray-800/60 pb-2.5">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-300 flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-500" />
                  BUDGET VARIANCE DELTA
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Surplus / Deficit
                </span>
              </div>

              <div className="w-full h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryVarianceData}
                    margin={{ top: 15, right: 10, left: -10, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#88888820" />
                    <XAxis
                      dataKey="category"
                      stroke="#78716c"
                      fontSize={9.5}
                      tickLine={false}
                      angle={-90}
                      textAnchor="end"
                      interval={0}
                      dy={5}
                    />
                    <YAxis
                      stroke="#78716c"
                      fontSize={9.5}
                      tickLine={false}
                      tickFormatter={(v) => `₹${v}`}
                    />
                    <Tooltip
                      formatter={(val: any) => [
                        Number(val) >= 0 
                          ? `+₹${Number(val).toLocaleString('en-IN')} (Under Budget / Saved)` 
                          : `-₹${Math.abs(Number(val)).toLocaleString('en-IN')} (Over Budget / Deficit)`,
                        'Variance'
                      ]}
                      contentStyle={{ backgroundColor: '#181a20', borderRadius: '12px', color: '#fff', fontSize: '11px', border: '1px solid #333' }}
                    />
                    <ReferenceLine y={0} stroke="#78716c" strokeWidth={1} strokeDasharray="3 3" />
                    <Bar dataKey="variance" radius={[4, 4, 0, 0]} maxBarSize={14}>
                      {categoryVarianceData.map((entry, index) => (
                        <Cell key={`var-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full flex justify-between text-[11px] text-gray-500 border-t border-gray-100 dark:border-gray-800/60 pt-2 font-medium">
                <span className="text-emerald-600 font-semibold">Green: Surplus (+₹{budgetSummary.reduce((acc, c) => acc + (c.difference > 0 ? c.difference : 0), 0).toLocaleString()})</span>
                <span className="text-[#e50914] font-semibold">Red: Deficit</span>
              </div>
            </div>
          </>
        )}

      </div>

      {/* Show More / Show Less Analytics Toggle Button */}
      <div className="flex items-center justify-center pt-1 pb-1">
        <button
          onClick={() => setShowAllCharts(!showAllCharts)}
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white dark:bg-[#16181f] hover:bg-red-50 dark:hover:bg-red-950/30 text-gray-800 hover:text-[#e50914] dark:text-gray-100 dark:hover:text-red-400 font-extrabold text-xs border border-gray-200 dark:border-gray-800 shadow-sm transition-all cursor-pointer group"
        >
          <span>{showAllCharts ? 'Show Less Analytics (Display 6 Charts)' : 'View More Analytics (+3 Additional Charts)'}</span>
          {showAllCharts ? (
            <ChevronUp className="w-4 h-4 text-[#e50914] group-hover:-translate-y-0.5 transition-transform" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#e50914] group-hover:translate-y-0.5 transition-transform" />
          )}
        </button>
      </div>

      {/* Navigation Tabs for the 4 Options / Sections */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-1 pt-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => { setActiveTab('budget'); setSearchQuery(''); setCategoryFilter('all'); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'budget'
                ? 'bg-[#e50914] text-white shadow-md shadow-red-500/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>1. Budget vs Actual Planner</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-black">
              {budgetSummary.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('transactions'); setSearchQuery(''); setCategoryFilter('all'); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'transactions'
                ? 'bg-[#e50914] text-white shadow-md shadow-red-500/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>2. Transactions (Expenses)</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-black">
              {expenses.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('income'); setSearchQuery(''); setCategoryFilter('all'); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'income'
                ? 'bg-[#e50914] text-white shadow-md shadow-red-500/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>3. Income Streams</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-black">
              {incomes.length}
            </span>
          </button>

          <button
            onClick={() => { setActiveTab('investment'); setSearchQuery(''); setCategoryFilter('all'); }}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'investment'
                ? 'bg-[#e50914] text-white shadow-md shadow-red-500/20'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span>4. Investment Portfolio</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-black">
              {investments.length}
            </span>
          </button>
        </div>

        {/* Tab-specific action button */}
        <div>
          {activeTab === 'budget' && (
            <button
              onClick={() => openAddModal('budget')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Set Category Budget</span>
            </button>
          )}
          {activeTab === 'transactions' && (
            <button
              onClick={() => openAddModal('expense')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-rose-600 via-red-600 to-red-700 hover:from-rose-700 hover:to-red-800 text-white text-xs font-bold rounded-xl shadow-md shadow-red-500/20 ring-1 ring-red-500/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          )}
          {activeTab === 'income' && (
            <button
              onClick={() => openAddModal('income')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 hover:from-emerald-600 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 ring-1 ring-emerald-500/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Income</span>
            </button>
          )}
          {activeTab === 'investment' && (
            <button
              onClick={() => openAddModal('investment')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 hover:from-indigo-700 hover:to-purple-800 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20 ring-1 ring-purple-500/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Investment</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Budget vs Actual Summary Table */}
      {activeTab === 'budget' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white dark:bg-[#181a20] rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Monthly Category Budget vs Actual Variance
                </h3>
                <p className="text-[11px] text-gray-500">
                  Planned allocations vs actual spent numbers with burn-rate status
                </p>
              </div>
              <span className="text-xs font-extrabold text-gray-700 dark:text-gray-300">
                Total Budget: ₹{totalPlannedBudget.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-gray-800/40 text-gray-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-gray-100 dark:border-gray-800">
                    <th className="py-3 px-5">Category</th>
                    <th className="py-3 px-5">Planned Budget (₹)</th>
                    <th className="py-3 px-5">Actual Spent (₹)</th>
                    <th className="py-3 px-5">Variance / Difference</th>
                    <th className="py-3 px-5">Budget Burn %</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
                  {budgetSummary.map((item) => (
                    <tr key={item.category} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-gray-400" />
                        {item.category}
                      </td>
                      <td className="py-3.5 px-5 font-semibold">
                        ₹{item.budget.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-5 font-bold text-gray-900 dark:text-white">
                        ₹{item.actual.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-5 font-bold">
                        <span className={item.difference >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {item.difference >= 0 ? `+₹${item.difference.toLocaleString('en-IN')}` : `-₹${Math.abs(item.difference).toLocaleString('en-IN')}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 min-w-[140px]">
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, item.percentUsed)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold block mt-1">
                          {item.percentUsed.toFixed(1)}% used
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        {item.isOverBudget ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100/80 dark:bg-red-950/40 px-2 py-0.5 rounded-md">
                            <AlertTriangle className="w-3 h-3" /> Over Budget
                          </span>
                        ) : item.actual > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-100/80 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                            <CheckCircle2 className="w-3 h-3" /> Under Budget
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                            Unused
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          onClick={() => {
                            setModalType('budget');
                            setEditingEntry({ category: item.category, budgetLimit: item.budget });
                            setFormData(prev => ({ ...prev, category: item.category, budgetLimit: String(item.budget) }));
                          }}
                          className="p-1.5 text-gray-400 hover:text-[#e50914] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Edit budget limit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50/90 dark:bg-gray-800/60 font-black text-xs border-t border-gray-200 dark:border-gray-700">
                    <td className="py-4 px-5">TOTAL</td>
                    <td className="py-4 px-5">₹{totalPlannedBudget.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-5 text-[#e50914]">₹{totalExpense.toLocaleString('en-IN')}</td>
                    <td className="py-4 px-5 text-emerald-600">
                      +₹{(totalPlannedBudget - totalExpense).toLocaleString('en-IN')}
                    </td>
                    <td className="py-4 px-5" colSpan={3}>
                      <span className="text-gray-500 font-bold">
                        Overall Utilization: {totalPlannedBudget > 0 ? ((totalExpense / totalPlannedBudget) * 100).toFixed(1) : 0}%
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Transactions (Expenses) Table */}
      {activeTab === 'transactions' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expense by description or category..."
                className="w-full bg-white dark:bg-[#181a20] border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white dark:bg-[#181a20] border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 text-xs text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Categories ({expenses.length})</option>
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white dark:bg-[#181a20] rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-gray-800/40 text-gray-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-gray-100 dark:border-gray-800">
                    <th className="py-3.5 px-5">Date</th>
                    <th className="py-3.5 px-5">Description</th>
                    <th className="py-3.5 px-5">Category</th>
                    <th className="py-3.5 px-5">Payment Method</th>
                    <th className="py-3.5 px-5">Amount (₹)</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                        No transactions found. Click &quot;Add Expense&quot; above to record one.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map((tx) => (
                      <tr key={tx._id || tx.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-gray-600 dark:text-gray-400">
                          {tx.date ? new Date(tx.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-gray-900 dark:text-white">
                          {tx.description || 'General Expense'}
                          {tx.notes && <span className="text-[10px] text-gray-400 block font-normal">{tx.notes}</span>}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-50 text-[#e50914] dark:bg-red-950/40 dark:text-red-400 border border-red-100 dark:border-red-900/50">
                            {tx.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-gray-500 font-medium">
                          {tx.paymentMethod || 'UPI / QR'}
                        </td>
                        <td className="py-3.5 px-5 font-extrabold text-sm text-[#e50914]">
                          ₹{Number(tx.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(tx)}
                              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(tx._id || tx.id, tx.description || 'Expense')}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Income Streams Table */}
      {activeTab === 'income' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search income by description or source..."
                className="w-full bg-white dark:bg-[#181a20] border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-[#181a20] rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-gray-800/40 text-gray-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-gray-100 dark:border-gray-800">
                    <th className="py-3.5 px-5">Date</th>
                    <th className="py-3.5 px-5">Source / Description</th>
                    <th className="py-3.5 px-5">Income Stream</th>
                    <th className="py-3.5 px-5">Payment Method</th>
                    <th className="py-3.5 px-5">Inflow Amount (₹)</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredIncomes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                        No income streams recorded yet. Click &quot;Add Income&quot; to log your first earnings.
                      </td>
                    </tr>
                  ) : (
                    filteredIncomes.map((inc) => (
                      <tr key={inc._id || inc.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-gray-600 dark:text-gray-400">
                          {inc.date ? new Date(inc.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-gray-900 dark:text-white">
                          {inc.description || 'Income'}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                            {inc.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-gray-500 font-medium">
                          {inc.paymentMethod || 'UPI / QR'}
                        </td>
                        <td className="py-3.5 px-5 font-extrabold text-sm text-emerald-600">
                          +₹{Number(inc.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(inc)}
                              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(inc._id || inc.id, inc.description || 'Income')}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Investment Portfolio Table */}
      {activeTab === 'investment' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white dark:bg-[#181a20] rounded-3xl border border-gray-200/60 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 dark:bg-gray-800/40 text-gray-400 uppercase text-[10px] font-extrabold tracking-wider border-b border-gray-100 dark:border-gray-800">
                    <th className="py-3.5 px-5">Date</th>
                    <th className="py-3.5 px-5">Asset / Instrument</th>
                    <th className="py-3.5 px-5">Portfolio Category</th>
                    <th className="py-3.5 px-5">Invested Capital (₹)</th>
                    <th className="py-3.5 px-5">Notes / Strategy</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {filteredInvestments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 text-xs">
                        No active investments logged yet. Click &quot;Add Investment&quot; to build your wealth tracker.
                      </td>
                    </tr>
                  ) : (
                    filteredInvestments.map((inv) => (
                      <tr key={inv._id || inv.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-gray-600 dark:text-gray-400">
                          {inv.date ? new Date(inv.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="py-3.5 px-5 font-bold text-gray-900 dark:text-white">
                          {inv.description || 'Asset'}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50">
                            {inv.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 font-extrabold text-sm text-purple-600">
                          ₹{Number(inv.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3.5 px-5 text-gray-500">
                          {inv.notes || '—'}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openEditModal(inv)}
                              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(inv._id || inv.id, inv.description || 'Investment')}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Import Sheet Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-xl bg-white dark:bg-[#181a20] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/30 text-[#e50914] flex items-center justify-center font-bold">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    Import Excel / CSV Sheet
                  </h3>
                  <p className="text-[12px] text-gray-500">
                    Upload &quot;Never Give Up&quot; spreadsheet or customized multi-sheet file
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4">
              {/* File Upload Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-[#e50914] rounded-2xl p-6 text-center cursor-pointer transition-all bg-gray-50/60 dark:bg-gray-800/30 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 mx-auto rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 group-hover:text-[#e50914] group-hover:scale-110 transition-all mb-3 shadow-xs">
                  <FileUp className="w-6 h-6" />
                </div>
                {importFile ? (
                  <div>
                    <span className="font-bold text-xs text-gray-900 dark:text-white block">
                      {importFile.name}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {(importFile.size / 1024).toFixed(1)} KB • Click to choose different file
                    </span>
                  </div>
                ) : (
                  <div>
                    <span className="font-bold text-xs text-gray-900 dark:text-white block">
                      Click or drag .xlsx / .csv spreadsheet here
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Supports multi-sheet workbooks (Budget, Transactions, Income, Investment)
                    </span>
                  </div>
                )}
              </div>

              {/* Parsed Summary Preview */}
              {parsedImportData && (
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Parsed Summary Preview
                    </span>
                    <span className="text-[11px] font-bold text-[#e50914]">
                      {parsedImportData.entries.length} Total Records
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/60 dark:border-gray-700">
                      <span className="text-[10px] text-gray-400 block font-bold">Budgets</span>
                      <span className="font-black text-gray-900 dark:text-white">
                        {parsedImportData.summary.budgets}
                      </span>
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/60 dark:border-gray-700">
                      <span className="text-[10px] text-gray-400 block font-bold">Expenses</span>
                      <span className="font-black text-red-600">
                        {parsedImportData.summary.expenses}
                      </span>
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/60 dark:border-gray-700">
                      <span className="text-[10px] text-gray-400 block font-bold">Incomes</span>
                      <span className="font-black text-emerald-600">
                        {parsedImportData.summary.incomes}
                      </span>
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-900 rounded-xl border border-gray-200/60 dark:border-gray-700">
                      <span className="text-[10px] text-gray-400 block font-bold">Investments</span>
                      <span className="font-black text-purple-600">
                        {parsedImportData.summary.investments}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Import Mode Selection */}
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Import Action Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setImportMode('append')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'append'
                        ? 'border-[#e50914] bg-red-50/50 dark:bg-red-950/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40'
                    }`}
                  >
                    <span className="font-bold text-xs text-gray-900 dark:text-white block">
                      Append to Existing
                    </span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">
                      Keep existing records and add new
                    </span>
                  </div>

                  <div
                    onClick={() => setImportMode('replace')}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'replace'
                        ? 'border-[#e50914] bg-red-50/50 dark:bg-red-950/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40'
                    }`}
                  >
                    <span className="font-bold text-xs text-gray-900 dark:text-white block">
                      Replace All Data
                    </span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">
                      Clear existing and sync fresh
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportSubmit}
                  disabled={!parsedImportData || isImporting}
                  className="px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {isImporting ? 'Importing Records...' : 'Confirm & Import Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Modal for Adding/Editing entries */}
      {modalType && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-lg bg-white dark:bg-[#181a20] border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-7 shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                  modalType === 'expense' ? 'bg-red-50 text-[#e50914]' :
                  modalType === 'income' ? 'bg-emerald-50 text-emerald-600' :
                  modalType === 'investment' ? 'bg-purple-50 text-purple-600' : 'bg-gray-100 text-gray-700'
                }`}>
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">
                    {editingEntry ? 'Edit Record' : modalType === 'expense' ? 'Add Expense Transaction' : modalType === 'income' ? 'Add Income Stream' : modalType === 'investment' ? 'Add Investment' : 'Set Category Budget'}
                  </h3>
                  <p className="text-[12px] text-gray-500">
                    Never Give Up Financial Hub Ledger
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalType(null)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
              {modalType === 'budget' ? (
                <>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g. Family, Things, Travel..."
                      className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Monthly Budget Limit (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.budgetLimit}
                      onChange={(e) => setFormData({ ...formData, budgetLimit: e.target.value })}
                      placeholder="e.g. 2000"
                      className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914] cursor-pointer"
                      >
                        {(modalType === 'expense' ? EXPENSE_CATEGORIES : modalType === 'income' ? INCOME_CATEGORIES : INVESTMENT_CATEGORIES).map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Amount (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="e.g. 2665"
                        className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Description / Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g. Flipkart shopping, Khandagiri room rent..."
                      className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                        Payment Method
                      </label>
                      <select
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none cursor-pointer"
                      >
                        {PAYMENT_METHODS.map(pm => (
                          <option key={pm} value={pm}>{pm}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional remarks..."
                      className="w-full bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-[#e50914]"
                    />
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-all cursor-pointer disabled:opacity-60 ${
                    modalType === 'expense'
                      ? 'bg-gradient-to-r from-rose-600 via-red-600 to-red-700 hover:from-rose-700 hover:to-red-800 shadow-red-500/25 ring-1 ring-red-500/30'
                      : modalType === 'income'
                      ? 'bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-700 hover:from-emerald-600 hover:to-teal-800 shadow-emerald-500/25 ring-1 ring-emerald-500/30'
                      : modalType === 'investment'
                      ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-700 hover:from-indigo-700 hover:to-purple-800 shadow-purple-500/25 ring-1 ring-purple-500/30'
                      : 'bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900'
                  }`}
                >
                  {isSubmitting ? 'Saving...' : editingEntry ? 'Save Changes' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
