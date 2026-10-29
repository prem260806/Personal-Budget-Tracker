import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Plus,
  ArrowRight,
  Calendar,
  CreditCard,
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
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'];

export const Dashboard = ({ onNavigate, onOpenAddModal, refreshKey }) => {
  const { user, formatCurrency } = useAuth();

  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [refreshKey]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, txRes, bRes, gRes] = await Promise.all([
        api.get('/transactions/summary'),
        api.get('/transactions?limit=6&sortBy=date&order=desc'),
        api.get('/budgets'),
        api.get('/goals'),
      ]);

      setSummary(sumRes.data.summary);
      setRecentTransactions(txRes.data.transactions);
      setBudgets(bRes.data.budgets);
      setGoals(gRes.data.goals);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check for budget alerts
  const budgetAlerts = budgets.filter((b) => b.percentage >= 80);

  // Format category totals for pie chart
  const categoryChartData = summary?.categoryTotals
    ? Object.entries(summary.categoryTotals).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Loading financial dashboard...</p>
        </div>
      </div>
    );
  }

  const netBalance = summary?.netBalance || 0;
  const totalIncome = summary?.totalIncome || 0;
  const totalExpense = summary?.totalExpense || 0;
  const savingsRate = summary?.savingsRate || 0;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Budget Alerts Banner if any category crossed 80% */}
      {budgetAlerts.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-900">
                Budget Alert: {budgetAlerts.length} category limit{budgetAlerts.length > 1 ? 's' : ''} nearing or exceeded!
              </p>
              <p className="text-xs text-amber-700">
                {budgetAlerts.map((b) => `${b.category} (${b.percentage}%)`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('budgets')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap"
          >
            Review Budgets
          </button>
        </div>
      )}

      {/* 2. TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Balance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Net Balance
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className={`text-2xl font-extrabold ${netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
              {formatCurrency(netBalance)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Total accumulated cash flow</p>
          </div>
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-24 h-24 bg-indigo-500/5 rounded-full pointer-events-none" />
        </div>

        {/* Total Income */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Income
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-emerald-600">
              {formatCurrency(totalIncome)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">From salary, freelance, investments</p>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Expenses
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-rose-600">
              {formatCurrency(totalExpense)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Across all spending categories</p>
          </div>
        </div>

        {/* Savings Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Savings Rate
            </span>
            <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600">
              <PiggyBank className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-extrabold text-violet-600">
              {savingsRate}%
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">
              {savingsRate >= 20 ? '✨ Healthy financial habit' : 'Target at least 20%'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Income vs Expense Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="font-bold text-slate-900 text-base">Income vs Expense Trend</h4>
              <p className="text-xs text-slate-400">Monthly cash flow comparison</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
              Monthly
            </span>
          </div>

          <div className="h-72 w-full">
            {summary?.monthlyTrends && summary.monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    formatter={(val) => formatCurrency(val)}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No monthly trend data yet. Add some transactions or click "Generate Demo Data".
              </div>
            )}
          </div>
        </div>

        {/* Expense Category Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-bold text-slate-900 text-base">Expense Breakdown</h4>
              <p className="text-xs text-slate-400">By category</p>
            </div>
          </div>

          <div className="h-56 w-full flex-1 relative">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                    }}
                    formatter={(val) => formatCurrency(val)}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No expense transactions recorded yet.
              </div>
            )}
          </div>

          {/* Mini Category legend */}
          <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1">
            {categoryChartData.slice(0, 4).map((c, i) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-slate-600 font-medium truncate max-w-[120px]">{c.name}</span>
                </div>
                <span className="font-semibold text-slate-800">{formatCurrency(c.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: Recent Transactions & Savings Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-base">Recent Transactions</h4>
              <p className="text-xs text-slate-400">Latest financial activities</p>
            </div>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            {recentTransactions.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Transaction</th>
                    <th className="pb-3 font-semibold">Category</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium">
                  {recentTransactions.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                              tx.type === 'income'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : '-'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-xs truncate max-w-[150px] sm:max-w-[200px]">
                              {tx.title}
                            </p>
                            <p className="text-[10px] text-slate-400">{tx.paymentMethod}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-slate-600">{tx.category}</td>
                      <td className="py-3 px-2 text-slate-400">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td
                        className={`py-3 pl-2 text-right font-bold ${
                          tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No transactions yet. Click "+ Add Transaction" to start!
              </div>
            )}
          </div>
        </div>

        {/* Savings Goals Overview */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-slate-900 text-base">Savings Targets</h4>
                <p className="text-xs text-slate-400">Your milestone goals</p>
              </div>
              <button
                onClick={() => onNavigate('goals')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Manage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4">
              {goals.slice(0, 3).map((goal) => (
                <div key={goal._id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 truncate max-w-[140px]">{goal.title}</span>
                    <span className="font-bold text-indigo-600">{goal.progress}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        goal.isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{formatCurrency(goal.savedAmount)} saved</span>
                    <span>Target: {formatCurrency(goal.targetAmount)}</span>
                  </div>
                </div>
              ))}

              {goals.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs">
                  No active goals set. Create one to start saving!
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('goals')}
            className="w-full mt-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl border border-indigo-100 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Goal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
