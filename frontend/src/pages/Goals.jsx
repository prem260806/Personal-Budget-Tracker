import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Trophy,
  Calendar,
  Sparkles,
  Trash2,
  Edit2,
  DollarSign,
  X,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const Goals = ({ refreshKey }) => {
  const { formatCurrency } = useAuth();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create/Edit Goal Modal
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [savedAmount, setSavedAmount] = useState('');
  const [category, setCategory] = useState('General Savings');
  const [targetDate, setTargetDate] = useState('');
  const [saving, setSaving] = useState(false);

  // Deposit Modal
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedGoalForDeposit, setSelectedGoalForDeposit] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositing, setDepositing] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, [refreshKey]);

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await api.get('/goals');
      setGoals(res.data.goals);
    } catch (err) {
      console.error('Error fetching goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setTitle('');
    setTargetAmount('');
    setSavedAmount('0');
    setCategory('General Savings');
    // Default target date: 6 months ahead
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    setTargetDate(d.toISOString().split('T')[0]);
    setGoalModalOpen(true);
  };

  const handleOpenEdit = (goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount);
    setSavedAmount(goal.savedAmount);
    setCategory(goal.category || 'General Savings');
    setTargetDate(new Date(goal.targetDate).toISOString().split('T')[0]);
    setGoalModalOpen(true);
  };

  const handleSaveGoal = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingGoal) {
        await api.put(`/goals/${editingGoal._id}`, {
          title,
          targetAmount: Number(targetAmount),
          savedAmount: Number(savedAmount),
          category,
          targetDate: new Date(targetDate),
        });
      } else {
        await api.post('/goals', {
          title,
          targetAmount: Number(targetAmount),
          savedAmount: Number(savedAmount) || 0,
          category,
          targetDate: new Date(targetDate),
        });
      }
      setGoalModalOpen(false);
      fetchGoals();
    } catch (err) {
      alert('Error saving goal: ' + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGoalForDeposit) return;
    setDepositing(true);
    try {
      const res = await api.patch(`/goals/${selectedGoalForDeposit._id}/deposit`, {
        amount: Number(depositAmount),
      });

      // If goal reached 100%, trigger confetti celebration!
      if (res.data.goal.isCompleted) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      setDepositModalOpen(false);
      setDepositAmount('');
      fetchGoals();
    } catch (err) {
      alert('Error contributing to goal: ' + (err.response?.data?.message || err.message));
    } finally {
      setDepositing(false);
    }
  };

  const handleDeleteGoal = async (id, goalTitle) => {
    if (!confirm(`Delete savings goal "${goalTitle}"?`)) return;
    try {
      await api.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      alert('Error deleting goal: ' + (err.response?.data?.message || err.message));
    }
  };

  const totalSavedAllGoals = goals.reduce((acc, g) => acc + g.savedAmount, 0);
  const totalTargetAllGoals = goals.reduce((acc, g) => acc + g.targetAmount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-lg sm:text-xl">Your Savings Targets</h3>
          <p className="text-xs text-slate-400">Track and fund your dream milestones</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-2xl shadow-md shadow-indigo-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Goal Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Saved So Far</span>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">{formatCurrency(totalSavedAllGoals)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Total Target Milestone</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{formatCurrency(totalTargetAllGoals)}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase">Overall Goal Completion</span>
          <p className="text-xl font-extrabold text-indigo-600 mt-1">
            {totalTargetAllGoals > 0
              ? `${((totalSavedAllGoals / totalTargetAllGoals) * 100).toFixed(1)}%`
              : '0%'}
          </p>
        </div>
      </div>

      {/* Goal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading savings goals...
          </div>
        ) : goals.length > 0 ? (
          goals.map((goal) => {
            const isFinished = goal.isCompleted || goal.savedAmount >= goal.targetAmount;
            return (
              <div
                key={goal._id}
                className="bg-white p-5 rounded-2xl border border-slate-200/70 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isFinished ? 'bg-amber-100 text-amber-700' : 'bg-indigo-50 text-indigo-600'
                        }`}
                      >
                        {isFinished ? <Trophy className="w-5 h-5" /> : <Target className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm truncate max-w-[150px]">
                          {goal.title}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {goal.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(goal)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg"
                        title="Edit goal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal._id, goal.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-50 rounded-lg"
                        title="Delete goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar & Numbers */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">
                        {formatCurrency(goal.savedAmount)}
                      </span>
                      <span className="font-bold text-indigo-600">{goal.progress}%</span>
                    </div>

                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isFinished
                            ? 'bg-gradient-to-r from-amber-400 to-emerald-500'
                            : 'bg-indigo-600'
                        }`}
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Target: {formatCurrency(goal.targetAmount)}</span>
                      <span>
                        {isFinished ? '🎉 Achieved!' : `Left: ${formatCurrency(goal.remaining)}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Target Date & Contribution Button */}
                <div className="pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Target Date:
                    </span>
                    <span className="font-semibold text-slate-600">
                      {new Date(goal.targetDate).toLocaleDateString()}
                    </span>
                  </div>

                  {!isFinished ? (
                    <button
                      onClick={() => {
                        setSelectedGoalForDeposit(goal);
                        setDepositModalOpen(true);
                      }}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl border border-indigo-100 transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Deposit</span>
                    </button>
                  ) : (
                    <div className="py-2 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200 text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Goal Target Reached!</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-slate-200/70 text-center space-y-3">
            <Target className="w-12 h-12 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No Savings Goals Yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create specific targets like "Emergency Safety Fund", "New Laptop", or "Vacation" to visualize your financial progress.
            </p>
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-sm hover:bg-indigo-700 transition-all inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Goal</span>
            </button>
          </div>
        )}
      </div>

      {/* CREATE / EDIT GOAL MODAL */}
      {goalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
              </h3>
              <button
                onClick={() => setGoalModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Emergency Fund, New Laptop"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Target Amount *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="50000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Already Saved
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={savedAmount}
                    onChange={(e) => setSavedAmount(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Deadline Date *
                </label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="General Savings">General Savings</option>
                  <option value="Emergency">Emergency Fund</option>
                  <option value="Electronics">Electronics & Gadgets</option>
                  <option value="Travel">Travel & Vacation</option>
                  <option value="Vehicle">Vehicle / Bike / Car</option>
                  <option value="Education">Education & Courses</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGoalModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEPOSIT CONTRIBUTION MODAL */}
      {depositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Add Contribution</h3>
                <p className="text-xs text-slate-400 truncate max-w-[220px]">
                  Towards "{selectedGoalForDeposit?.title}"
                </p>
              </div>
              <button
                onClick={() => setDepositModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Deposit Amount *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 5000"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDepositModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={depositing}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{depositing ? 'Contributing...' : 'Confirm Deposit'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
