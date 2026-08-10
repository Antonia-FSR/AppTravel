import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { DebtorsSection } from './components/DebtorsSection';
import { ProgressChart } from './components/ProgressChart';
import { Transaction, Category, PaymentMethod, SavingsData, Debtor } from './types';
import { Plane, MapPin, Download } from 'lucide-react';
import { motion } from 'motion/react';
import { exportDataToExcel } from './utils';

const STORAGE_KEY = 'india_trip_savings_data';

const DEFAULT_GOAL = 3000000;

export default function App() {
  const [data, setData] = useState<SavingsData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse savings data');
      }
    }
    return { goal: DEFAULT_GOAL, transactions: [], debtors: [] };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const debtors = data.debtors || [];

  const totalRaised = data.transactions.reduce((sum, tx) => sum + (tx.type === 'expense' ? -tx.amount : tx.amount), 0) + debtors.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0);
  const totalEfectivo = data.transactions.filter(tx => tx.paymentMethod === 'Efectivo').reduce((sum, tx) => sum + (tx.type === 'expense' ? -tx.amount : tx.amount), 0) + debtors.filter(d => d.status === 'paid' && d.paymentMethod === 'Efectivo').reduce((sum, d) => sum + d.amount, 0);
  const totalTransferencia = data.transactions.filter(tx => tx.paymentMethod === 'Transferencia').reduce((sum, tx) => sum + (tx.type === 'expense' ? -tx.amount : tx.amount), 0) + debtors.filter(d => d.status === 'paid' && d.paymentMethod === 'Transferencia').reduce((sum, d) => sum + d.amount, 0);

  const handleUpdateGoal = (newGoal: number) => {
    setData((prev) => ({ ...prev, goal: newGoal }));
  };

  const handleAddTransaction = (
    type: 'income' | 'expense',
    amount: number,
    category: Category,
    customCategory: string | undefined,
    paymentMethod: PaymentMethod,
    note: string,
    quantity?: number,
    quantityUnit?: 'Unidades' | 'Kilogramos'
  ) => {
    const newTx: Transaction = {
      id: crypto.randomUUID(),
      type,
      amount,
      category,
      customCategory,
      paymentMethod,
      quantity,
      quantityUnit,
      note,
      date: new Date().toISOString(),
    };

    setData((prev) => ({
      ...prev,
      transactions: [newTx, ...prev.transactions],
    }));
  };

  const handleUpdateTransaction = (id: string, updatedTx: Partial<Transaction>) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.map(tx => tx.id === id ? { ...tx, ...updatedTx } : tx)
    }));
  };

  const handleDeleteTransaction = (id: string) => {
    setData((prev) => ({
      ...prev,
      transactions: prev.transactions.filter(tx => tx.id !== id)
    }));
  };

  const handleAddDebtor = (name: string, amount: number, note: string) => {
    const newDebtor: Debtor = {
      id: crypto.randomUUID(),
      name,
      amount,
      note,
      status: 'pending',
      date: new Date().toISOString(),
    };
    setData((prev) => ({
      ...prev,
      debtors: [newDebtor, ...(prev.debtors || [])],
    }));
  };

  const handlePayDebtor = (id: string, paymentMethod: PaymentMethod) => {
    setData((prev) => ({
      ...prev,
      debtors: (prev.debtors || []).map(d => 
        d.id === id 
          ? { ...d, status: 'paid', paymentMethod, paidDate: new Date().toISOString() } 
          : d
      )
    }));
  };

  const handleUpdateDebtor = (id: string, updatedDebtor: Partial<Debtor>) => {
    setData((prev) => ({
      ...prev,
      debtors: (prev.debtors || []).map(d => d.id === id ? { ...d, ...updatedDebtor } : d)
    }));
  };

  const handleDeleteDebtor = (id: string) => {
    setData((prev) => ({
      ...prev,
      debtors: (prev.debtors || []).filter(d => d.id !== id)
    }));
  };

  return (
    <div className="min-h-screen bg-stone-50 text-slate-800 font-sans selection:bg-orange-200 selection:text-orange-900 overflow-x-hidden">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden flex justify-center">
        <div className="absolute top-0 w-full max-w-5xl h-full flex justify-between opacity-30">
          <div className="w-[800px] h-[800px] bg-orange-100 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/3" />
          <div className="w-[600px] h-[600px] bg-teal-50 rounded-full blur-[80px] translate-y-1/3 translate-x-1/3" />
        </div>
      </div>

      <div className="relative w-full max-w-3xl mx-auto px-4 py-8 sm:py-12 md:py-16">
        
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center text-center mb-10"
        >
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold tracking-wide mb-4 shadow-sm border border-orange-200">
            <Plane className="w-4 h-4 mr-2" />
            Misión 2027/2028
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight text-balance flex items-center justify-center flex-wrap gap-x-3">
            Fondo Viaje a 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-600 flex items-center">
              India <MapPin className="w-8 h-8 ml-1 text-rose-500 inline-block" />
            </span>
          </h1>
          <p className="mt-4 text-slate-500 max-w-md text-balance">
            Cada esfuerzo cuenta. Registra tus ahorros y acércate paso a paso a la aventura de tu vida.
          </p>
          <button
            onClick={() => exportDataToExcel(data.transactions, debtors)}
            className="mt-6 flex items-center justify-center px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-orange-600 rounded-xl shadow-sm transition-all text-sm font-medium"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar a Excel
          </button>
        </motion.header>

        {/* Main Content Grid */}
        <main className="space-y-6">
          <Dashboard 
            total={totalRaised} 
            totalEfectivo={totalEfectivo}
            totalTransferencia={totalTransferencia}
            goal={data.goal} 
            onUpdateGoal={handleUpdateGoal} 
          />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5 lg:col-span-5">
              <TransactionForm onAddTransaction={handleAddTransaction} />
            </div>
            
            <div className="md:col-span-7 lg:col-span-7">
              <TransactionList 
                transactions={data.transactions} 
                onUpdateTransaction={handleUpdateTransaction}
                onDeleteTransaction={handleDeleteTransaction}
              />
            </div>
          </div>
          
          <DebtorsSection 
            debtors={debtors}
            onAddDebtor={handleAddDebtor}
            onPayDebtor={handlePayDebtor}
            onUpdateDebtor={handleUpdateDebtor}
            onDeleteDebtor={handleDeleteDebtor}
          />

          <ProgressChart 
            transactions={data.transactions}
            debtors={debtors}
          />
        </main>
      </div>
    </div>
  );
}
