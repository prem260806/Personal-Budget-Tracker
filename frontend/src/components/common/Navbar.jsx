import React, { useState } from 'react';
import { Menu, Sparkles, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export const Navbar = ({ activeTab, setMobileOpen, onRefreshData, onOpenAddModal }) => {
  const { user } = useAuth();
  const [seeding, setSeeding] = useState(false);

  const titles = {
    dashboard: { title: 'Financial Dashboard', subtitle: 'Overview of your personal finances and cashflow' },
    transactions: { title: 'Transactions Manager', subtitle: 'Detailed record of all your income and expenses' },
    budgets: { title: 'Category Budgets', subtitle: 'Set monthly limits to maintain healthy spending habits' },
    goals: { title: 'Savings Targets & Goals', subtitle: 'Track your progress towards future milestones' },
    analytics: { title: 'Visual Financial Analytics', subtitle: 'Interactive graphs, trends, and spending patterns' },
    settings: { title: 'Account & Preferences', subtitle: 'Manage profile information and currency settings' },
  };

  const handleSeedData = async () => {
    if (!confirm('This will load realistic demo transactions, budgets, and savings goals for your account. Continue?')) {
      return;
    }
    setSeeding(true);
    try {
      await api.post('/seed');
      if (onRefreshData) onRefreshData();
      alert('✅ Realistic sample demo data populated successfully!');
    } catch (err) {
      alert('Failed to seed data: ' + (err.response?.data?.message || err.message));
    } finally {
      setSeeding(false);
    }
  };

  const currentInfo = titles[activeTab] || titles.dashboard;

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 leading-tight">
            {currentInfo.title}
          </h2>
          <p className="text-xs text-slate-400 font-medium hidden sm:block">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick Seed / Demo Data Generator Button */}
        <button
          onClick={handleSeedData}
          disabled={seeding}
          title="Populate realistic demo transactions for college presentation"
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/70 rounded-xl transition-all shadow-sm"
        >
          <Sparkles className={`w-4 h-4 text-amber-600 ${seeding ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">{seeding ? 'Loading Demo...' : 'Generate Demo Data'}</span>
          <span className="md:hidden">Demo</span>
        </button>

        {/* Currency Tag */}
        <div className="hidden sm:flex items-center px-3 py-1.5 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200/60">
          <span>Currency: {user?.currency || 'INR'}</span>
        </div>

        {/* Quick Add Transaction Button */}
        {onOpenAddModal && (
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Transaction</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}
      </div>
    </header>
  );
};
