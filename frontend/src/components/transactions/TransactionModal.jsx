import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2 } from 'lucide-react';

export const CATEGORIES = {
  expense: [
    'Food & Dining',
    'Rent & Housing',
    'Utilities',
    'Shopping',
    'Travel & Commute',
    'Entertainment',
    'Health & Medical',
    'Education',
    'Personal Care',
    'Other Expense',
  ],
  income: [
    'Salary',
    'Freelance',
    'Investments',
    'Business',
    'Gift / Bonus',
    'Other Income',
  ],
};

export const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Other',
];

export const TransactionModal = ({ isOpen, onClose, onSave, editingTransaction }) => {
  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES.expense[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type || 'expense');
      setTitle(editingTransaction.title || '');
      setAmount(editingTransaction.amount || '');
      setCategory(editingTransaction.category || CATEGORIES.expense[0]);
      setPaymentMethod(editingTransaction.paymentMethod || 'UPI');
      setDate(
        editingTransaction.date
          ? new Date(editingTransaction.date).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      );
      setNotes(editingTransaction.notes || '');
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setCategory(CATEGORIES.expense[0]);
      setPaymentMethod('UPI');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [editingTransaction, isOpen]);

  // Update default category when type changes
  const handleTypeChange = (newType) => {
    setType(newType);
    setCategory(CATEGORIES[newType][0]);
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({
        title,
        amount: Number(amount),
        type,
        category,
        paymentMethod,
        date: new Date(date),
        notes,
      });
      onClose();
    } catch (err) {
      alert('Error saving transaction: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {editingTransaction ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {editingTransaction ? 'Edit Transaction' : 'Record New Transaction'}
              </h3>
              <p className="text-xs text-slate-400">Add detailed entry for accurate tracking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Income vs Expense toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💸 Expense
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💰 Income
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Transaction Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Grocery Shopping, Monthly Salary"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {CATEGORIES[type].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Notes & Comments (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Additional details, merchant info, tags..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editingTransaction ? 'Update Entry' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
