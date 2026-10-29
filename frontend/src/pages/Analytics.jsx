import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  CreditCard,
  PieChart as PieIcon,
  Sparkles,
  Zap,
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
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6', '#06b6d4', '#f97316', '#64748b'];

export const Analytics = ({ refreshKey }) => {
  const { formatCurrency } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [refreshKey]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analytics');
      setData(res.data.analytics);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500">Generating in-depth analytics...</p>
        </div>
      </div>
    );
  }

  const {
    totalIncome = 0,
    totalExpense = 0,
    netSavings = 0,
    healthScore = 70,
    expenseByCategory = [],
    incomeByCategory = [],
    spendingByPayment = [],
    monthlyTrends = [],
  } = data || {};

  // Financial advice based on health score
  const getHealthAdvice = (score) => {
    if (score >= 90) {
      return {
        badge: 'Excellent Financial Health',
        color: 'text-emerald-700 bg-emerald-100 border-emerald-300',
        text: 'Outstanding! You are saving >30% of your income. Continue compounding through investments and maintaining low non-essential expenses.',
      };
    } else if (score >= 70) {
      return {
        badge: 'Good Financial Habit',
        color: 'text-indigo-700 bg-indigo-100 border-indigo-300',
        text: 'Great job! You maintain a positive cash flow. Consider optimizing discretionary expenses like shopping or dining to boost your emergency fund.',
      };
    } else {
      return {
        badge: 'Attention Needed',
        color: 'text-amber-700 bg-amber-100 border-amber-300',
        text: 'Expenses are matching or exceeding income. Consider setting strict category budget limits on dining and entertainment.',
      };
    }
  };

  const advice = getHealthAdvice(healthScore);

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Health Score & Key Highlights Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md bg-white/10 text-indigo-200 border-white/20">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Smart Financial Insights</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black tracking-tight">
              Personal Cashflow & Portfolio Health
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200/80 leading-relaxed">
              {advice.text}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/30 flex items-center justify-center border border-indigo-400/40">
              <span className="text-2xl font-black text-white">{healthScore}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                Score / 100
              </span>
              <p className="text-xs font-bold text-emerald-400 mt-0.5">{advice.badge}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Net Monthly Cashflow Line Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-base">Net Cash Flow Trend</h4>
              <p className="text-xs text-slate-400">Net monthly savings trajectory</p>
            </div>
          </div>

          <div className="h-72 w-full">
            {monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val) => formatCurrency(val)}
                  />
                  <Line
                    type="monotone"
                    dataKey="net"
                    name="Net Balance"
                    stroke="#6366f1"
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#6366f1' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No monthly trend data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Expense Category Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-base">Expense Distribution</h4>
              <p className="text-xs text-slate-400">Spending by category</p>
            </div>
          </div>

          <div className="h-72 w-full">
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val) => formatCurrency(val)}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No expenses available to chart.
              </div>
            )}
          </div>
        </div>

        {/* Income Sources Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-base">Income Sources</h4>
              <p className="text-xs text-slate-400">Where your money comes from</p>
            </div>
          </div>

          <div className="h-72 w-full">
            {incomeByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeByCategory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val) => formatCurrency(val)}
                  />
                  <Bar dataKey="value" name="Income Amount" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No income data recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-slate-900 text-base">Payment Method Breakdown</h4>
              <p className="text-xs text-slate-400">Cash vs UPI vs Cards</p>
            </div>
          </div>

          <div className="h-72 w-full">
            {spendingByPayment.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={spendingByPayment} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    formatter={(val) => formatCurrency(val)}
                  />
                  <Bar dataKey="value" name="Amount" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                No payment method data recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
