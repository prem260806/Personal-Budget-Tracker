import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Budgets } from './pages/Budgets';
import { Goals } from './pages/Goals';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { TransactionModal } from './components/transactions/TransactionModal';
import api from './services/api';

export default function App() {
  const { isAuthenticated, loading } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Global Transaction Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const triggerRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleOpenAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tx) => {
    setEditingTransaction(tx);
    setIsModalOpen(true);
  };

  const handleSaveTransaction = async (txData) => {
    if (editingTransaction) {
      await api.put(`/transactions/${editingTransaction._id}`, txData);
    } else {
      await api.post('/transactions', txData);
    }
    triggerRefresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-indigo-200">Initializing Personal Budget Tracker...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Navbar
          activeTab={activeTab}
          setMobileOpen={setMobileOpen}
          onRefreshData={triggerRefresh}
          onOpenAddModal={handleOpenAddModal}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigate={setActiveTab}
              onOpenAddModal={handleOpenAddModal}
              refreshKey={refreshKey}
            />
          )}

          {activeTab === 'transactions' && (
            <Transactions
              onOpenAddModal={handleOpenAddModal}
              onEditTransaction={handleOpenEditModal}
              refreshKey={refreshKey}
            />
          )}

          {activeTab === 'budgets' && <Budgets refreshKey={refreshKey} />}

          {activeTab === 'goals' && <Goals refreshKey={refreshKey} />}

          {activeTab === 'analytics' && <Analytics refreshKey={refreshKey} />}

          {activeTab === 'settings' && <Settings onRefreshData={triggerRefresh} />}
        </main>
      </div>

      {/* Global Add/Edit Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
      />
    </div>
  );
}
