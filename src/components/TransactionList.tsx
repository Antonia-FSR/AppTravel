import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Transaction, Category, PaymentMethod } from '../types';
import { formatCurrency, formatDate, CATEGORIES, PAYMENT_METHODS, QUANTITY_UNITS } from '../utils';
import { 
  Store,
  Briefcase, 
  CircleDollarSign,
  TrendingUp,
  Pencil,
  Trash2,
  Check,
  X,
  Landmark,
  Banknote,
  Leaf,
  Cookie,
  CakeSlice,
  Package,
  Nut,
  Croissant
} from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onUpdateTransaction: (id: string, tx: Partial<Transaction>) => void;
  onDeleteTransaction: (id: string) => void;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Venta salón':
      return <Store className="w-5 h-5 text-teal-600" />;
    case 'Corbatas':
      return <Briefcase className="w-5 h-5 text-indigo-500" />;
    case 'Vainas':
      return <Leaf className="w-5 h-5 text-emerald-500" />;
    case 'Chocolate':
      return <Cookie className="w-5 h-5 text-amber-700" />;
    case 'Manjar':
      return <CakeSlice className="w-5 h-5 text-orange-400" />;
    case 'Coco':
      return <Package className="w-5 h-5 text-stone-500" />;
    case 'Nueces':
      return <Nut className="w-5 h-5 text-amber-800" />;
    case 'Galletas':
      return <Croissant className="w-5 h-5 text-yellow-600" />;
    case 'Otro':
      return <CircleDollarSign className="w-5 h-5 text-slate-500" />;
    default:
      return <CircleDollarSign className="w-5 h-5 text-slate-500" />;
  }
};

const getCategoryBg = (category: string, type: 'income' | 'expense') => {
  if (type === 'expense') return 'bg-rose-100';
  switch (category) {
    case 'Venta salón': return 'bg-teal-100';
    case 'Corbatas': return 'bg-indigo-100';
    case 'Otro': return 'bg-slate-200';
    default: return 'bg-slate-100';
  }
};

export function TransactionList({ transactions, onUpdateTransaction, onDeleteTransaction }: TransactionListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Transaction>>({});

  const startEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setEditForm(tx);
  };

  const saveEdit = () => {
    if (editingId && editForm.amount && editForm.category && editForm.paymentMethod) {
      if (editForm.category === 'Otro' && !editForm.customCategory?.trim()) {
        return; // require custom category for 'Otro'
      }
      onUpdateTransaction(editingId, editForm);
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-orange-100 text-center">
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-orange-300" />
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-1">Aún no hay movimientos</h3>
        <p className="text-slate-500 text-sm">Registra tu primer movimiento para comenzar.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-orange-100"
    >
      <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4">
        Historial de Movimientos
      </h3>
      
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence initial={false}>
          {transactions.map((tx) => {
            const isExpense = tx.type === 'expense';
            return (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, height: 0, scale: 0.9 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative rounded-2xl bg-slate-50 border border-slate-100/50 overflow-hidden"
              >
                {editingId === tx.id ? (
                  <div className="p-4 bg-orange-50/50 border border-orange-200/50 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Monto</label>
                        <input
                          type="number"
                          min="1"
                          value={editForm.amount || ''}
                          onChange={(e) => setEditForm({ ...editForm, amount: parseInt(e.target.value) || 0 })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Categoría</label>
                        <select
                          value={editForm.category || ''}
                          onChange={(e) => setEditForm({ ...editForm, category: e.target.value as Category, customCategory: e.target.value !== 'Otro' ? undefined : editForm.customCategory })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      {editForm.category === 'Otro' && (
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-slate-600 mb-1">Especificar Otro</label>
                          <input
                            type="text"
                            required
                            value={editForm.customCategory || ''}
                            onChange={(e) => setEditForm({ ...editForm, customCategory: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                            placeholder="Ej. Rifa solidaria"
                          />
                        </div>
                      )}
                      
                      {isExpense && (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Cantidad</label>
                            <input
                              type="number"
                              step="any"
                              value={editForm.quantity || ''}
                              onChange={(e) => setEditForm({ ...editForm, quantity: parseFloat(e.target.value) || undefined })}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Unidad</label>
                            <select
                              value={editForm.quantityUnit || ''}
                              onChange={(e) => setEditForm({ ...editForm, quantityUnit: e.target.value as any })}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                            >
                              <option value="">Ninguna</option>
                              {QUANTITY_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Método</label>
                        <select
                          value={editForm.paymentMethod || ''}
                          onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value as PaymentMethod })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                        >
                          {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Detalles</label>
                        <input
                          type="text"
                          value={editForm.note || ''}
                          onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:outline-none"
                          placeholder="Opcional"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <button onClick={cancelEdit} className="px-3 py-1.5 flex items-center text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors">
                        <X className="w-4 h-4 mr-1" /> Cancelar
                      </button>
                      <button onClick={saveEdit} className="px-3 py-1.5 flex items-center text-xs font-medium text-white bg-teal-500 hover:bg-teal-600 rounded-lg transition-colors">
                        <Check className="w-4 h-4 mr-1" /> Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 md:p-4 group gap-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shrink-0 ${getCategoryBg(tx.category, tx.type || 'income')}`}>
                        {getCategoryIcon(tx.category)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-slate-800 text-sm md:text-base flex items-center gap-1.5 truncate">
                          {tx.category === 'Otro' && tx.customCategory ? tx.customCategory : tx.category}
                        </h4>
                        <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                          <span className="whitespace-nowrap">{formatDate(tx.date)}</span>
                          <span className="flex items-center gap-1 text-slate-400 md:border-l md:border-slate-200 md:pl-2 whitespace-nowrap">
                            {tx.paymentMethod === 'Transferencia' ? <Landmark className="w-3.5 h-3.5" /> : <Banknote className="w-3.5 h-3.5" />}
                            {tx.paymentMethod}
                          </span>
                        </div>
                        {(tx.note || (isExpense && tx.quantity)) && (
                          <p className="text-xs text-slate-600 mt-1.5 line-clamp-1 italic">
                            {tx.note} {isExpense && tx.quantity ? `(${tx.quantity} ${tx.quantityUnit || ''})` : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end shrink-0 ml-2">
                      <div className={`font-bold ${isExpense ? 'text-rose-600' : 'text-teal-600'}`}>
                        {isExpense ? '-' : '+'}{formatCurrency(tx.amount)}
                      </div>
                      <div className="flex items-center gap-1 mt-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => startEdit(tx)}
                          className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors"
                          title="Editar"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
