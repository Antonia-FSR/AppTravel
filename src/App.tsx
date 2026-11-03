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
import { db } from './lib/firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const DEFAULT_GOAL = 3000000;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SavingsData>({ goal: DEFAULT_GOAL, transactions: [], debtors: [] });

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setData(prev => ({ ...prev, goal: doc.data().goal }));
      } else {
        setDoc(doc.ref, { goal: DEFAULT_GOAL });
      }
    });

    const unsubTx = onSnapshot(collection(db, 'transactions'), (snapshot) => {
      const txs = snapshot.docs.map(doc => doc.data() as Transaction);
      txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setData(prev => ({ ...prev, transactions: txs }));
      setLoading(false);
    });

    const unsubDebtors = onSnapshot(collection(db, 'debtors'), (snapshot) => {
      const dbtrs = snapshot.docs.map(doc => doc.data() as Debtor);
      dbtrs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setData(prev => ({ ...prev, debtors: dbtrs }));
    });

    return () => {
      unsubSettings();
      unsubTx();
      unsubDebtors();
    };
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-orange-500 font-medium">Conectando a la base de datos...</div>;
  }

  const debtors = data.debtors || [];

  const totalRaised = data.transactions.reduce((sum, tx) => sum + (tx.type === 'expense' ? -tx.amount : tx.amount), 0) + debtors.filter(d => d.status === 'paid').reduce((sum, d) => sum + d.amount, 0);
  const totalEfectivo = data.transactions.filter(tx => tx.paymentMethod === 'Efectivo').reduce((sum, tx) => sum + (tx.type === 'expense' ? -tx.amount : tx.amount), 0) + debtors.filter(d => d.status === 'paid' && d.paymentMethod === 'Efectivo').reduce((sum, d) => sum + d.amount, 0);
  const totalTransferencia = data.transactions.filter(tx => tx.paymentMethod === 'Transferencia').reduce((sum, tx) => sum + (tx.type === 'expense' ? -tx.amount : tx.amount), 0) + debtors.filter(d => d.status === 'paid' && d.paymentMethod === 'Transferencia').reduce((sum, d) => sum + d.amount, 0);

  const handleUpdateGoal = async (newGoal: number) => {
    await setDoc(doc(db, 'settings', 'global'), { goal: newGoal }, { merge: true });
  };

 const handleAddTransaction = async (
    type: 'income' | 'expense',
    amount: number,
    category: Category,
    customCategory: string | undefined,
    paymentMethod: PaymentMethod,
    note: string,
    quantity?: number,
    quantityUnit?: 'Unidades' | 'Kilogramos'
  ) => {
    try {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2);
      const newTx: any = {
        id,
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
      
      // Elimina los valores "undefined" para prevenir errores de Firestore
      Object.keys(newTx).forEach(key => newTx[key] === undefined && delete newTx[key]);

      await setDoc(doc(db, 'transactions', id), {
        ...newTx,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error al guardar transacción:", error);
      alert("Hubo un error al guardar la transacción. Revisa tu conexión a internet.");
    }
  };
  const handleUpdateTransaction = async (id: string, updatedTx: Partial<Transaction>) => {
    const safeUpdate = { ...updatedTx };
    Object.keys(safeUpdate).forEach(key => (safeUpdate as any)[key] === undefined && delete (safeUpdate as any)[key]);
    await updateDoc(doc(db, 'transactions', id), safeUpdate);
  };

  const handleDeleteTransaction = async (id: string) => {
    await deleteDoc(doc(db, 'transactions', id));
  };

  const handleAddDebtor = async (name: string, amount: number, note: string) => {
    const id = crypto.randomUUID();
    const newDebtor: Debtor = {
      id,
      name,
      amount,
      note,
      status: 'pending',
      date: new Date().toISOString(),
    };
    await setDoc(doc(db, 'debtors', id), {
      ...newDebtor,
      createdAt: new Date().toISOString()
    });
  };

  const handlePayDebtor = async (id: string, paymentMethod: PaymentMethod) => {
    await updateDoc(doc(db, 'debtors', id), {
      status: 'paid',
      paymentMethod,
      paidDate: new Date().toISOString()
    });
  };

  const handleUpdateDebtor = async (id: string, updatedDebtor: Partial<Debtor>) => {
    const safeUpdate = { ...updatedDebtor };
    Object.keys(safeUpdate).forEach(key => (safeUpdate as any)[key] === undefined && delete (safeUpdate as any)[key]);
    await updateDoc(doc(db, 'debtors', id), safeUpdate);
  };

  const handleDeleteDebtor = async (id: string) => {
    await deleteDoc(doc(db, 'debtors', id));
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
              ¿? <MapPin className="w-8 h-8 ml-1 text-rose-500 inline-block" />
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
