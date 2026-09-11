import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface FinanceExportData {
  budgets: any[];
  expenses: any[];
  incomes: any[];
  investments: any[];
}

/**
 * Exports complete 4-sheet Excel workbook matching the NEVER GIVE UP structure
 */
export function exportToExcelWorkbook(entries: any[], filename = 'NEVER_GIVE_UP_Finance_Ledger.xlsx') {
  const wb = XLSX.utils.book_new();

  const budgets = entries.filter((e) => e.type === 'budget');
  const expenses = entries.filter((e) => e.type === 'expense');
  const incomes = entries.filter((e) => e.type === 'income');
  const investments = entries.filter((e) => e.type === 'investment');

  // 1. Budget Sheet
  const budgetData = budgets.map((b) => {
    const actualSpent = expenses
      .filter((e) => (e.category || '').toLowerCase() === (b.category || '').toLowerCase())
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    const limit = Number(b.budgetLimit) || 0;
    return {
      Category: b.category,
      'Planned Budget (₹)': limit,
      'Actual Spent (₹)': actualSpent,
      'Variance (₹)': limit - actualSpent,
      'Burn %': limit > 0 ? `${((actualSpent / limit) * 100).toFixed(1)}%` : '—',
      Status: actualSpent > limit && limit > 0 ? 'Over Budget' : actualSpent > 0 ? 'Under Budget' : 'Unused',
    };
  });
  const budgetWs = XLSX.utils.json_to_sheet(budgetData.length ? budgetData : [{ Category: '', 'Planned Budget (₹)': 0, 'Actual Spent (₹)': 0, 'Variance (₹)': 0 }]);
  XLSX.utils.book_append_sheet(wb, budgetWs, 'Budget');

  // 2. Transactions (Expenses) Sheet
  const expenseData = expenses.map((e) => ({
    Date: e.date ? new Date(e.date).toISOString().split('T')[0] : '',
    Description: e.description || '',
    Category: e.category || 'Others',
    'Payment Method': e.paymentMethod || 'UPI / QR',
    'Amount (₹)': Number(e.amount) || 0,
    Notes: e.notes || '',
  }));
  const expenseWs = XLSX.utils.json_to_sheet(expenseData.length ? expenseData : [{ Date: '', Description: '', Category: '', 'Payment Method': '', 'Amount (₹)': 0, Notes: '' }]);
  XLSX.utils.book_append_sheet(wb, expenseWs, 'Transactions');

  // 3. Income Sheet
  const incomeData = incomes.map((i) => ({
    Date: i.date ? new Date(i.date).toISOString().split('T')[0] : '',
    'Source / Description': i.description || '',
    Category: i.category || 'Others',
    'Payment Method': i.paymentMethod || 'UPI / QR',
    'Amount (₹)': Number(i.amount) || 0,
    Notes: i.notes || '',
  }));
  const incomeWs = XLSX.utils.json_to_sheet(incomeData.length ? incomeData : [{ Date: '', 'Source / Description': '', Category: '', 'Payment Method': '', 'Amount (₹)': 0, Notes: '' }]);
  XLSX.utils.book_append_sheet(wb, incomeWs, 'Income');

  // 4. Investment Sheet
  const investmentData = investments.map((inv) => ({
    Date: inv.date ? new Date(inv.date).toISOString().split('T')[0] : '',
    'Asset / Instrument': inv.description || '',
    Category: inv.category || 'General',
    'Invested Capital (₹)': Number(inv.amount) || 0,
    Notes: inv.notes || '',
  }));
  const investmentWs = XLSX.utils.json_to_sheet(investmentData.length ? investmentData : [{ Date: '', 'Asset / Instrument': '', Category: '', 'Invested Capital (₹)': 0, Notes: '' }]);
  XLSX.utils.book_append_sheet(wb, investmentWs, 'Investment');

  // Write and trigger download
  XLSX.writeFile(wb, filename);
}

/**
 * Exports a single section as CSV
 */
export function exportSingleSectionCSV(type: 'budget' | 'transactions' | 'income' | 'investment', entries: any[]) {
  let data: any[] = [];
  let filename = `${type}_export.csv`;

  if (type === 'budget') {
    const budgets = entries.filter((e) => e.type === 'budget');
    const expenses = entries.filter((e) => e.type === 'expense');
    data = budgets.map((b) => {
      const actual = expenses
        .filter((e) => (e.category || '').toLowerCase() === (b.category || '').toLowerCase())
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
      return {
        Category: b.category,
        'Planned Budget': b.budgetLimit || 0,
        'Actual Spent': actual,
        Difference: (b.budgetLimit || 0) - actual,
      };
    });
    filename = 'Budget_Summary.csv';
  } else if (type === 'transactions') {
    data = entries
      .filter((e) => e.type === 'expense')
      .map((e) => ({
        Date: e.date ? new Date(e.date).toISOString().split('T')[0] : '',
        Description: e.description || '',
        Category: e.category || '',
        Amount: e.amount || 0,
        'Payment Method': e.paymentMethod || '',
        Notes: e.notes || '',
      }));
    filename = 'Transactions_Expenses.csv';
  } else if (type === 'income') {
    data = entries
      .filter((e) => e.type === 'income')
      .map((i) => ({
        Date: i.date ? new Date(i.date).toISOString().split('T')[0] : '',
        Description: i.description || '',
        Category: i.category || '',
        Amount: i.amount || 0,
        'Payment Method': i.paymentMethod || '',
        Notes: i.notes || '',
      }));
    filename = 'Income_Streams.csv';
  } else if (type === 'investment') {
    data = entries
      .filter((e) => e.type === 'investment')
      .map((inv) => ({
        Date: inv.date ? new Date(inv.date).toISOString().split('T')[0] : '',
        Description: inv.description || '',
        Category: inv.category || '',
        Amount: inv.amount || 0,
        Notes: inv.notes || '',
      }));
    filename = 'Investments.csv';
  }

  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Parses uploaded Excel (.xlsx, .xls) or CSV file into FinanceEntry items
 */
export async function parseImportFile(file: File): Promise<{
  entries: any[];
  summary: { budgets: number; expenses: number; incomes: number; investments: number };
}> {
  return new Promise((resolve, reject) => {
    const isCsv = file.name.endsWith('.csv');
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const parsedEntries: any[] = [];
        const summary = { budgets: 0, expenses: 0, incomes: 0, investments: 0 };

        if (isCsv) {
          const csvText = e.target?.result as string;
          const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
          const rows: any[] = result.data;

          rows.forEach((row) => {
            const desc = row.Description || row.description || row['Source / Description'] || row['Item'] || '';
            const cat = row.Category || row.category || 'General';
            const amt = parseFloat(row.Amount || row.amount || row['Amount (₹)'] || row['Invested Capital (₹)'] || '0') || 0;
            const budgetLimit = parseFloat(row['Planned Budget'] || row['Budget'] || row['budgetLimit'] || '0') || 0;
            const dateStr = row.Date || row.date || '';
            const paymentMethod = row['Payment Method'] || row.paymentMethod || 'UPI / QR';
            const notes = row.Notes || row.notes || '';

            if (budgetLimit > 0 || row['Planned Budget'] !== undefined) {
              parsedEntries.push({
                type: 'budget',
                category: cat,
                description: `${cat} Budget`,
                amount: 0,
                budgetLimit,
              });
              summary.budgets++;
            } else if (amt > 0 || desc) {
              // Default to expense if not specified
              parsedEntries.push({
                type: 'expense',
                category: cat,
                description: desc,
                amount: amt,
                date: dateStr ? new Date(dateStr) : new Date(),
                paymentMethod,
                notes,
              });
              summary.expenses++;
            }
          });
        } else {
          // XLSX workbook
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });

          workbook.SheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
            const sNameLower = sheetName.toLowerCase();

            rows.forEach((row) => {
              const cat = row.Category || row.category || (sNameLower.includes('budget') ? row['Income Category'] || 'General' : 'General');
              const desc = row.Description || row.description || row['Source / Description'] || row['Asset / Instrument'] || row['Category'] || '';
              const amt = parseFloat(row.Amount || row.amount || row['Amount (₹)'] || row['Amounts'] || row['Invested Capital (₹)'] || row['Actual'] || '0') || 0;
              const budgetLimit = parseFloat(row['Planned Budget (₹)'] || row['Planned Budget'] || row['Budget'] || '0') || 0;
              const dateVal = row.Date || row.date || '';
              const paymentMethod = row['Payment Method'] || row.paymentMethod || 'UPI / QR';
              const notes = row.Notes || row.notes || '';

              if (sNameLower.includes('budget') || budgetLimit > 0) {
                if (cat && (budgetLimit > 0 || amt > 0)) {
                  parsedEntries.push({
                    type: 'budget',
                    category: String(cat).trim(),
                    description: `${String(cat).trim()} Budget`,
                    amount: 0,
                    budgetLimit: budgetLimit || amt,
                  });
                  summary.budgets++;
                }
              } else if (sNameLower.includes('income')) {
                if (amt > 0 || desc) {
                  parsedEntries.push({
                    type: 'income',
                    category: String(cat).trim(),
                    description: String(desc || cat).trim(),
                    amount: amt,
                    date: dateVal ? new Date(dateVal) : new Date(),
                    paymentMethod,
                    notes,
                  });
                  summary.incomes++;
                }
              } else if (sNameLower.includes('invest')) {
                if (amt > 0 || desc) {
                  parsedEntries.push({
                    type: 'investment',
                    category: String(cat).trim(),
                    description: String(desc || 'Investment').trim(),
                    amount: amt,
                    date: dateVal ? new Date(dateVal) : new Date(),
                    notes,
                  });
                  summary.investments++;
                }
              } else {
                // Transactions / Expenses
                if (amt > 0 || desc) {
                  parsedEntries.push({
                    type: 'expense',
                    category: String(cat).trim(),
                    description: String(desc || 'Expense').trim(),
                    amount: amt,
                    date: dateVal ? new Date(dateVal) : new Date(),
                    paymentMethod,
                    notes,
                  });
                  summary.expenses++;
                }
              }
            });
          });
        }

        resolve({ entries: parsedEntries, summary });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);

    if (isCsv) {
      reader.readAsText(file);
    } else {
      reader.readAsArrayBuffer(file);
    }
  });
}
