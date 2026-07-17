import React, { useState, useMemo } from 'react';
import { Coins, Download, Car, Wallet, CalendarDays, Briefcase, Activity } from 'lucide-react';

// --- INLINE DATE HELPERS ---
const parseLocalSafe = (dateStr) => {
  try {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d || isNaN(y) || isNaN(m) || isNaN(d)) return new Date();
    return new Date(y, m - 1, d);
  } catch (e) {
    return new Date();
  }
};

const getPastPayPeriods = (anchorDateStr, count = 26) => {
  const periods = [];
  const anchor = parseLocalSafe(anchorDateStr || '2026-07-01');
  const now = new Date();
  
  const diffDays = Math.floor((now - anchor) / 86400000);
  const cycles = Math.floor(diffDays / 14);
  const currentStart = new Date(anchor.getTime() + cycles * 14 * 86400000);

  for (let i = 0; i < count; i++) {
    const start = new Date(currentStart.getTime() - (i * 14 * 86400000));
    const end = new Date(start.getTime() + 13 * 86400000);
    periods.push({ start, end, isCurrent: i === 0 });
  }
  return periods;
};

export default function AdminEarningsManager({ 
  walkers = [], 
  walks = [], 
  mileageLogs = [], 
  payPeriodStart = '2026-07-01', 
  flatRatePayout = 25, 
  mileageRate = 0.68 
}) {
  // --- PAY PERIOD LOGIC ---
  const allPeriods = useMemo(() => getPastPayPeriods(payPeriodStart), [payPeriodStart]);
  
  const availableYears = useMemo(() => {
    const years = allPeriods.map(p => p.end.getFullYear());
    return [...new Set(years)].sort((a, b) => b - a);
  }, [allPeriods]);

  const [selectedYear, setSelectedYear] = useState(availableYears[0]?.toString() || new Date().getFullYear().toString());
  const [selectedPeriodTime, setSelectedPeriodTime] = useState('');

  const filteredPeriods = useMemo(() => {
    return allPeriods.filter(p => p.end.getFullYear().toString() === selectedYear);
  }, [allPeriods, selectedYear]);

  const activePeriod = useMemo(() => {
    if (selectedPeriodTime) {
      const found = filteredPeriods.find(p => p.start.getTime().toString() === selectedPeriodTime);
      if (found) return found;
    }
    return filteredPeriods[0] || allPeriods[0];
  }, [filteredPeriods, selectedPeriodTime, allPeriods]);

  const currentPeriodStart = activePeriod.start;
  const currentPeriodEnd = activePeriod.end;

  // --- EARNINGS CALCULATOR ---
  const walkerEarnings = useMemo(() => {
    return walkers.filter(w => w.isActive && w.id !== 'admin1').map(walker => {
      
      // 1. Calculate Walk Earnings (Status MUST be 'completed')
      const completedWalks = walks.filter(w => {
        if (w.walkerId !== walker.id || w.status !== 'completed' || !w.date) return false;
        const d = parseLocalSafe(w.date);
        return d >= currentPeriodStart && d <= currentPeriodEnd;
      });
      const walkCount = completedWalks.length;
      const walkEarnings = walkCount * flatRatePayout;

      // 2. Calculate Mileage
      const periodMileage = mileageLogs.filter(m => {
        if (m.walkerId !== walker.id || !m.date) return false;
        const d = parseLocalSafe(m.date);
        return d >= currentPeriodStart && d <= currentPeriodEnd;
      });
      const totalKms = periodMileage.reduce((sum, m) => sum + Number(m.kilometers || 0), 0);
      const mileageEarnings = totalKms * mileageRate;

      return {
        ...walker,
        walkCount,
        walkEarnings,
        totalKms,
        mileageEarnings,
        totalEarnings: walkEarnings + mileageEarnings
      };
    }).filter(w => w.totalEarnings > 0 || w.walkCount > 0).sort((a, b) => b.totalEarnings - a.totalEarnings);
  }, [walkers, walks, mileageLogs, currentPeriodStart, currentPeriodEnd, flatRatePayout, mileageRate]);

  // --- WIDGET TOTALS ---
  const totalPayrollLiability = walkerEarnings.reduce((sum, w) => sum + w.totalEarnings, 0);
  const totalWalkPayouts = walkerEarnings.reduce((sum, w) => sum + w.walkEarnings, 0);
  const totalMileageReimbursements = walkerEarnings.reduce((sum, w) => sum + w.mileageEarnings, 0);
  const totalCompletedWalks = walkerEarnings.reduce((sum, w) => sum + w.walkCount, 0);

  // --- CSV EXPORTER ---
  const exportToCSV = () => {
    const payPeriodDisplay = `${currentPeriodStart.toLocaleDateString('en-US')} to ${currentPeriodEnd.toLocaleDateString('en-US')}`;
    
    const summaryRows = [
      ['EXECUTIVE SUMMARY'],
      ['Pay Period', `"${payPeriodDisplay}"`],
      ['Total Payroll Liability', `"$${totalPayrollLiability.toFixed(2)}"`],
      ['Total Walk Payouts', `"$${totalWalkPayouts.toFixed(2)}"`],
      ['Total Mileage Reimbursements', `"$${totalMileageReimbursements.toFixed(2)}"`],
      ['Total Completed Walks', totalCompletedWalks],
      [], 
      ['LINE-BY-LINE BREAKDOWN']
    ];

    const tableHeaders = ['Walker Name', 'Completed Walks', `Walk Earnings (@ $${flatRatePayout})`, 'Total Kilometers', `Mileage Earnings (@ $${mileageRate}/km)`, 'Total Due ($)'];

    const tableRows = walkerEarnings.map(w => [
      `"${w.name}"`, 
      w.walkCount,
      w.walkEarnings.toFixed(2),
      w.totalKms.toFixed(1),
      w.mileageEarnings.toFixed(2),
      w.totalEarnings.toFixed(2)
    ]);

    const csvContent = [
      ...summaryRows.map(r => r.join(',')),
      tableHeaders.join(','),
      ...tableRows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const startDateStr = currentPeriodStart.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).replace(' ', '_');
    const endDateStr = currentPeriodEnd.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).replace(' ', '_');
    link.setAttribute('download', `Walker_Earnings_${startDateStr}_to_${endDateStr}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      {/* HEADER & CONTROLS */}
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center">
          <Coins className="h-6 w-6 mr-2 text-teal-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-800">Payroll & Earnings</h2>
            <p className="text-xs text-slate-500 font-medium">Flat-rate walk payouts + mileage reimbursements</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
          <button onClick={exportToCSV} className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-md hover:bg-slate-700 transition shadow-sm text-sm font-bold shrink-0">
            <Download className="h-4 w-4" /> <span>Export CSV</span>
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto shrink-0">
            <label className="text-sm font-medium text-slate-600 whitespace-nowrap">Pay Period:</label>
            <div className="flex space-x-2 w-full sm:w-auto">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-1/3 sm:w-auto px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-bold text-slate-700 shadow-sm"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={activePeriod.start.getTime().toString()}
                onChange={(e) => setSelectedPeriodTime(e.target.value)}
                className="w-2/3 sm:w-auto px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white font-bold text-slate-700 shadow-sm"
              >
                {filteredPeriods.map((period) => (
                  <option key={period.start.getTime()} value={period.start.getTime().toString()}>
                    {period.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &ndash; {period.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {period.isCurrent ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* FINANCIAL WIDGETS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 border-b border-slate-200 bg-slate-50/50">
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center"><Wallet className="h-4 w-4 mr-2 text-teal-600"/> Total Payroll Liability</div>
          <div className="text-4xl font-black text-slate-800 tracking-tight">${totalPayrollLiability.toFixed(2)}</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">For selected pay period</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center"><Activity className="h-4 w-4 mr-2 text-blue-600"/> Walk Payouts</div>
          <div className="text-3xl font-black text-slate-800 tracking-tight">${totalWalkPayouts.toFixed(2)}</div>
          <div className="flex items-center text-xs text-slate-500 mt-2 font-medium bg-slate-50 w-fit px-2 py-1 rounded">
            <CalendarDays className="h-3 w-3 mr-1.5 text-slate-400" /> {totalCompletedWalks} Completed Walks
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center"><Car className="h-4 w-4 mr-2 text-indigo-600"/> Mileage Reimbursements</div>
          <div className="text-3xl font-black text-slate-800 tracking-tight">${totalMileageReimbursements.toFixed(2)}</div>
          <div className="text-xs text-slate-400 mt-2 font-medium">Reimbursed at ${mileageRate}/km</div>
        </div>

      </div>

      {/* DETAILED LEDGER */}
      <div className="overflow-y-auto flex-1 bg-white">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead className="sticky top-0 bg-slate-100 shadow-sm z-10">
            <tr className="text-slate-500 text-[10px] uppercase tracking-wider border-b border-slate-200">
              <th className="px-6 py-4 font-bold">Walker</th>
              <th className="px-6 py-4 font-bold text-center">Completed Walks</th>
              <th className="px-6 py-4 font-bold text-right">Walk Earnings</th>
              <th className="px-6 py-4 font-bold text-right">Mileage</th>
              <th className="px-6 py-4 font-bold text-right text-slate-800">Total Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {walkerEarnings.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium bg-slate-50/50">No walks completed in this pay period.</td>
              </tr>
            ) : (
              walkerEarnings.map(walker => (
                <tr key={walker.id} className="hover:bg-slate-50 transition group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800 text-base">{walker.name}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="inline-flex items-center justify-center bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full border border-blue-100">
                      {walker.walkCount}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-bold text-slate-700">${walker.walkEarnings.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">@ ${flatRatePayout}/walk</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="font-bold text-slate-700">${walker.mileageEarnings.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">{walker.totalKms.toFixed(1)} km logged</div>
                  </td>
                  <td className="px-6 py-4 text-right text-emerald-600 font-black text-xl">
                    ${walker.totalEarnings.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
