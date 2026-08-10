import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { Category, PaymentMethod, TransactionType, QuantityUnit } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHODS, QUANTITY_UNITS } from '../utils';

interface TransactionFormProps {
  onAddTransaction: (
    type: TransactionType,
    amount: number,
    category: Category,
    customCategory: string | undefined,
    paymentMethod: PaymentMethod,
    note: string,
    quantity?: number,
    quantityUnit?: QuantityUnit
  ) => void;
}

export function TransactionForm({ onAddTransaction }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [customCategory, setCustomCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [note, setNote] = useState('');
  
  const [quantity, setQuantity] = useState('');
  const [quantityUnit, setQuantityUnit] = useState<QuantityUnit | ''>('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !paymentMethod) return;
    if (category === 'Otro' && !customCategory.trim()) return;
    
    if (type === 'expense' && (quantity && !quantityUnit)) return;

    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const parsedQuantity = quantity ? parseFloat(quantity) : undefined;

    setIsSubmitting(true);
    
    // Simulate slight delay for visual feedback
    setTimeout(() => {
      onAddTransaction(
        type, 
        parsedAmount, 
        category as Category, 
        category === 'Otro' ? customCategory : undefined, 
        paymentMethod as PaymentMethod, 
        note,
        parsedQuantity,
        parsedQuantity ? (quantityUnit as QuantityUnit) : undefined
      );
      setAmount('');
      setCategory('');
      setCustomCategory('');
      setPaymentMethod('');
      setQuantity('');
      setQuantityUnit('');
      setNote('');
      setIsSubmitting(false);
    }, 400);
  };

  const currentCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-orange-100"
    >
      <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => { setType('income'); setCategory(''); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            type === 'income' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Nuevo Ingreso
        </button>
        <button
          type="button"
          onClick={() => { setType('expense'); setCategory(''); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
            type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Nuevo Egreso
        </button>
      </div>

      <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
        {type === 'income' ? (
          <PlusCircle className="mr-2 text-teal-500" size={20} />
        ) : (
          <MinusCircle className="mr-2 text-rose-500" size={20} />
        )}
        {type === 'income' ? 'Registrar Ingreso' : 'Registrar Egreso'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-slate-600 mb-1">
            Monto
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
            <input
              type="number"
              id="amount"
              required
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              placeholder="Ej. 15000"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-600 mb-1">
            Categoría
          </label>
          <select
            id="category"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all appearance-none"
          >
            <option value="" disabled>Selecciona una categoría</option>
            {currentCategories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <AnimatePresence>
          {category === 'Otro' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2">
                <label htmlFor="customCategory" className="block text-sm font-medium text-slate-600 mb-1">
                  ¿A qué se refiere? <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  id="customCategory"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  placeholder="Ej. Rifa solidaria"
                />
              </div>
            </motion.div>
          )}

          {type === 'expense' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-2 flex gap-4">
                <div className="flex-1">
                  <label htmlFor="quantity" className="block text-sm font-medium text-slate-600 mb-1">
                    Cantidad (Opcional)
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    min="0"
                    step="any"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all"
                    placeholder="Ej. 2.5"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="quantityUnit" className="block text-sm font-medium text-slate-600 mb-1">
                    Unidad
                  </label>
                  <select
                    id="quantityUnit"
                    required={!!quantity}
                    value={quantityUnit}
                    onChange={(e) => setQuantityUnit(e.target.value as QuantityUnit)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all appearance-none"
                  >
                    <option value="" disabled>Seleccionar</option>
                    {QUANTITY_UNITS.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-slate-600 mb-1">
            Método de Pago
          </label>
          <select
            id="paymentMethod"
            required
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all appearance-none"
          >
            <option value="" disabled>Selecciona un método</option>
            {PAYMENT_METHODS.map((pm) => (
              <option key={pm} value={pm}>{pm}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-medium text-slate-600 mb-1">
            Detalles <span className="text-slate-400 font-normal">(Opcional)</span>
          </label>
          <input
            type="text"
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
            placeholder={type === 'income' ? "Ej. Venta en la universidad" : "Ej. Compra en el supermercado"}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSubmitting}
          type="submit"
          className={`w-full mt-2 py-3.5 px-4 text-white rounded-xl font-medium shadow-md transition-all flex justify-center items-center ${
            type === 'income' 
              ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 shadow-teal-500/20'
              : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-rose-500/20'
          }`}
        >
          {isSubmitting ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            />
          ) : (
            type === 'income' ? 'Guardar Ingreso' : 'Guardar Egreso'
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
