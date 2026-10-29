import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Coins,
  DollarSign,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Server,
  Database,
  Code2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const Settings = ({ onRefreshData }) => {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [monthlyIncome, setMonthlyIncome] = useState(user?.monthlyIncome || '');
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [message, setMessage] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await updateProfile({
        name,
        phone,
        currency,
        monthlyIncome: monthlyIncome ? Number(monthlyIncome) : 0,
      });
      setMessage('Profile settings updated successfully! 🎉');
      if (onRefreshData) onRefreshData();
    } catch (err) {
      alert('Error updating profile: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleSeedData = async () => {
    if (!confirm('This will load realistic demo transactions, budgets, and savings goals for your account. Continue?')) {
      return;
    }
    setSeeding(true);
    try {
      await api.post('/seed');
      if (onRefreshData) onRefreshData();
      alert('✅ Demo data loaded successfully!');
    } catch (err) {
      alert('Failed to seed data: ' + (err.response?.data?.message || err.message));
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Settings Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/70 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Account & Preferences</h3>
          <p className="text-xs text-slate-400">Manage your profile details and currency settings</p>
        </div>

        {message && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address (Read-Only)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number (For OTP Recovery)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  placeholder="+91..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Currency
              </label>
              <div className="relative">
                <Coins className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="INR">₹ INR (Indian Rupee)</option>
                  <option value="USD">$ USD (US Dollar)</option>
                  <option value="EUR">€ EUR (Euro)</option>
                  <option value="GBP">£ GBP (British Pound)</option>
                  <option value="CAD">CA$ CAD (Canadian Dollar)</option>
                  <option value="AUD">AU$ AUD (Australian Dollar)</option>
                  <option value="SGD">S$ SGD (Singapore Dollar)</option>
                  <option value="AED">AED (UAE Dirham)</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monthly Base Income
              </label>
              <input
                type="number"
                placeholder="50000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* College Project Viva / Demo Assistant Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/70 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 text-slate-900">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-bold">College Project Demo Data Generator</h3>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Need rich sample data to show during your viva / project presentation? Click below to instantly generate realistic income, expense records, budget allocations, and savings targets.
        </p>

        <button
          onClick={handleSeedData}
          disabled={seeding}
          className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl shadow-md shadow-amber-200 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
          <span>{seeding ? 'Populating Records...' : 'Generate Demo Sample Records'}</span>
        </button>
      </div>

      {/* Technical Architecture Badge */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-lg space-y-3">
        <h4 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
          <Code2 className="w-4 h-4" />
          <span>Technical Architecture</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-slate-300 block mb-1">Frontend Layer</span>
            <p className="text-slate-400">React 18, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios</p>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-slate-300 block mb-1">Backend Layer</span>
            <p className="text-slate-400">Node.js, Express.js REST API, JWT Auth, Bcrypt, Nodemailer</p>
          </div>
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
            <span className="font-bold text-slate-300 block mb-1">Database Layer</span>
            <p className="text-slate-400">MongoDB + Mongoose ODM with compound indexes & TTL</p>
          </div>
        </div>
      </div>
    </div>
  );
};
