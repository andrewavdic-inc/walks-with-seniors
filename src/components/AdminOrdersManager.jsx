import React, { useState, useMemo } from 'react';
import { Download, CheckCircle, Clock, Trash2, DollarSign, Filter, Receipt } from 'lucide-react';

export default function AdminOrdersManager({ orders = [], runMutation }) {
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'this_month', 'last_month'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'paid'

  // --- DATA FILTERING ---
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return orders.filter(order => {
      // 1. Filter by Status
      if (statusFilter === 'pending' && order.status !== 'Pending Verification') return false;
      if (statusFilter === 'paid' && order.status !== 'Paid') return false;

      // 2. Filter by Time
      if (timeFilter !== 'all') {
        const orderDate = new Date(order.createdAt || Date.now());
        const orderMonth = orderDate.getMonth();
        const orderYear = orderDate.getFullYear();

        if (timeFilter === 'this_month') {
          if (orderMonth !== currentMonth || orderYear !== currentYear) return false;
        } else if (timeFilter === 'last_month') {
          let lastMonth = currentMonth - 1;
          let lastMonthYear = currentYear;
          if (lastMonth < 0) {
            lastMonth = 11;
            lastMonthYear -= 1;
          }
          if (orderMonth !== lastMonth || orderYear !== lastMonthYear) return false;
        }
      }
      return true;
    }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [orders, timeFilter, statusFilter]);

  // --- AR SUMMARIES ---
  const totalReceivables = filteredOrders.reduce((sum, order) => sum + Number(order.price || 0), 0);
  const totalPending = filteredOrders.filter(o => o.status === 'Pending Verification').reduce((sum, order) => sum + Number(order.price || 0), 0);
  const totalPaid = filteredOrders.filter(o => o.status === 'Paid').reduce((sum, order) => sum + Number(order.price || 0), 0);

  // --- CSV EXPORT LOGIC ---
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return alert("No data to export.");
    
    const headers = ['Order ID', 'Date Created', 'Senior Name', 'Item Description', 'Walk Date', 'Status', 'Amount ($)'];
    const rows = filteredOrders.map(order => [
      order.id,
      new Date(order.createdAt).toLocaleDateString(),
      `"${order.seniorName || 'Unknown'}"`, // Quotes prevent commas in names from breaking CSV columns
      `"${order.itemName || ''}"`,
      order.walkDate || 'N/A',
      order.status,
      order.price
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', `AHA_Accounts_Receivable_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- ACTIONS ---
  const handleMarkPaid = async (orderId) => {
    if (window.confirm("Mark this order as paid? This confirms you have received the funds in Stripe.")) {
      await runMutation('ws_orders', orderId, 'update', { status: 'Paid' });
    }
  };

  const handleDelete = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order record?")) {
      await runMutation('ws_orders', orderId, 'delete');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* HEADER & EXPORT */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <Receipt className="h-6 w-6 mr-2 text-teal-600" /> Accounts Receivable
          </h2>
          <p className="text-sm text-slate-500">Track and verify incoming add-on orders and bookings.</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition shadow-sm text-sm"
        >
          <Download className="h-4 w-4 mr-2" /> Export to CSV
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center">
          <div className="bg-teal-50 p-3 rounded-lg text-teal-600 mr-4"><DollarSign className="h-6 w-6"/></div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Total Revenue</div>
            <div className="text-2xl font-black text-slate-800">${totalReceivables.toFixed(2)}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center">
          <div className="bg-amber-50 p-3 rounded-lg text-amber-600 mr-4"><Clock className="h-6 w-6"/></div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Pending Stripe</div>
            <div className="text-2xl font-black text-slate-800">${totalPending.toFixed(2)}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center">
          <div className="bg-emerald-50 p-3 rounded-lg text-emerald-600 mr-4"><CheckCircle className="h-6 w-6"/></div>
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Verified Paid</div>
            <div className="text-2xl font-black text-slate-800">${totalPaid.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* FILTERS & DATA TABLE */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* FILTERS ROW */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex items-center text-sm font-bold text-slate-700">
            <Filter className="h-4 w-4 mr-2 text-teal-600"/> View Filters:
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select 
              value={timeFilter} 
              onChange={e => setTimeFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 text-sm font-medium bg-white"
            >
              <option value="all">All Time</option>
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
            </select>
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-teal-500 text-sm font-medium bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Verification</option>
              <option value="paid">Verified Paid</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Date / Senior</th>
                <th className="p-4">Item Details</th>
                <th className="p-4">Target Walk Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Amount</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-500 font-medium">No transactions found for these filters.</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-800">{order.seniorName || 'Unknown Senior'}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{order.itemName}</td>
                    <td className="p-4 text-slate-600">{order.walkDate ? new Date(order.walkDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-4">
                      {order.status === 'Paid' ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" /> Paid
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center">
                          <Clock className="h-3 w-3 mr-1" /> Pending Stripe
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right font-black text-slate-800">
                      ${Number(order.price).toFixed(2)}
                    </td>
                    <td className="p-4 flex justify-center space-x-2">
                      {order.status !== 'Paid' && (
                        <button 
                          onClick={() => handleMarkPaid(order.id)}
                          className="text-xs bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 px-3 py-1.5 rounded font-bold transition shadow-sm"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(order.id)}
                        className="text-slate-400 hover:text-red-600 p-1.5 transition"
                        title="Delete Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
