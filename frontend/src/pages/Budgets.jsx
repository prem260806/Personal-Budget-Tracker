import React, { useState, useEffect } from 'react';
import {
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PieChart,
  Trash2,
  Calendar,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CATEGORIES } from '../components/transactions/TransactionModal';

export const Budgets = ({ refreshKey }) => {
  const { formatCurrency } = useAuth();

  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [limitAmount, setLimitAmount] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear, refreshKey]);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/budgets?month=${selectedMonth}&year=${selectedYear}`);
      setBudgets(res.data.budgets);
    } catch (err) {
      console.error('Error fetching budgets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/budgets', {
        category,
        limitAmount: Number(limitAmount),
        month: selectedMonth,
        year: selectedYear,
      });
      setModalOpen(false);
      setLimitAmount('');
      fetchBudgets();
    } catch (err) {
      alert('Error saving budget: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBudget = async (id, catName) => {
    if (!confirm(`Delete budget limit for ${catName}?`)) return;
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch (err) {
      alert('Error deleting budget: ' + (err.response?.data?.message || err.message));
    }
  };

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.limitAmount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spent, 0);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Month/Year selector */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/70 shadow-sm">
          <Calendar className="w-4 h-4 text-indigo-600 ml-2" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-2 py-1 text-xs font-semibold bg-transparent border-none focus:outline-none text-slate-800"
          >
            {months.map((m, idx) => (
              <option key={m} value={idx + 1}>
                {m}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-2 py-1 text-xs font-semibold bg-transparent border-none focus:outline-none text-slate-800"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Set Budget button */}
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-2xl shadow-md shadow-indigo-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Set Category Budget</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Budget</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(totalBudgeted)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Spent</span>
          <p className="text-xl font-extrabold text-rose-600 mt-1">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Remaining Pool</span>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">
            {formatCurrency(Math.max(0, totalBudgeted - totalSpent))}
          </p>
        </div>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading category budgets...
          </div>
        ) : budgets.length > 0 ? (
          budgets.map((b) => {
            const isExceeded = b.status === 'exceeded';
            const isWarning = b.status === 'warning';

            return (
              <div
                key={b._id}
                className={`bg-white p-5 rounded-2xl border shadow-sm space-y-3.5 transition-all hover:shadow-md ${
                  isExceeded
                    ? 'border-rose-200 bg-rose-50/20'
                    : isWarning
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{b.category}</h4>
                    <p className="text-[11px] text-slate-400">
                      Limit: {formatCurrency(b.limitAmount)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isExceeded && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Exceeded
                      </span>
                    )}
                    {isWarning && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Warning
                      </span>
                    )}
                    {!isExceeded && !isWarning && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> On Track
                      </span>
                    )}

                    <button
                      onClick={() => handleDeleteBudget(b._id, b.category)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors ml-1"
                      title="Delete budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-600">
                      Spent: {formatCurrency(b.spent)}
                    </span>
                    <span
                      className={`font-bold ${
                        isExceeded ? 'text-rose-600' : isWarning ? 'text-amber-600' : 'text-slate-800'
                      }`}
                    >
                      {b.percentage}%
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, b.percentage)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100/80">
                  <span>Remaining: <strong>{formatCurrency(b.remaining)}</strong></span>
                  <span>{months[selectedMonth - 1]} {selectedYear}</span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200/70 text-center space-y-3">
            <PieChart className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No Budgets Set For This Month</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Setting category budgets prevents overspending and alerts you before exceeding your targets.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-sm hover:bg-indigo-700 transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Budget</span>
            </button>
          </div>
        )}
      </div>

      {/* Set Budget Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Set Monthly Category Budget</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBudget} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {CATEGORIES.expense.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Limit Amount *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="5000"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl text-xs text-indigo-800">
                <span>
                  Configuring budget for: <strong>{months[selectedMonth - 1]} {selectedYear}</strong>
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
