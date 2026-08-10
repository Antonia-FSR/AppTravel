import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, CheckCircle, Clock, Check, X, Landmark, Banknote, Pencil, Trash2 } from 'lucide-react';
import { Debtor, PaymentMethod } from '../types';
import { formatCurrency, formatDate, PAYMENT_METHODS } from '../utils';

interface DebtorsSectionProps {
  debtors: Debtor[];
  onAddDebtor: (name: string, amount: number, note: string) => void;
  onPayDebtor: (id: string, paymentMethod: PaymentMethod) => void;
  onUpdateDebtor: (id: string, debtor: Partial<Debtor>) => void;
  onDeleteDebtor: (id: string) => void;
}

export function DebtorsSection({ debtors, onAddDebtor, onPayDebtor, onUpdateDebtor, onDeleteDebtor }: DebtorsSectionProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  
  const [payingId, setPayingId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Debtor>>({});

  const startEdit = (debtor: Debtor) => {
    setEditingId(debtor.id);
    setEditForm(debtor);
    setPayingId(null);
  };

  const saveEdit = () => {
    if (editingId && editForm.name && editForm.amount) {
      onUpdateDebtor(editingId, editForm);
      setEditingId(null);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    
    onAddDebtor(name, parsedAmount, note);
    setName('');
    setAmount('');
    setNote('');
  };

  const handleConfirmPay = (id: string) => {
    if (paymentMethod) {
      onPayDebtor(id, paymentMethod as PaymentMethod);
      setPayingId(null);
      setPaymentMethod('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-orange-100"
    >
      <h3 className="text-lg font-semibold text-slate-800 mb-6 border-b border-slate-100 pb-4 flex items-center">
        <Users className="mr-2 text-indigo-500" size={20} />
        Sección de Deudores
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulario */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-4">Agregar Deudor</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Monto</label>
              <input
                type="number"
                required
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Ej. 5000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Detalles (Opcional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Ej. Resto de la venta"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl font-medium transition-colors text-sm"
            >
              Registrar Deudor
            </button>
          </form>
        </div>

        {/* Lista */}
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-4">Lista de Deudores</h4>
          {debtors.length === 0 ? (
            <div className="text-center p-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
              <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No hay deudores registrados.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {debtors.map((debtor) => (
                  <motion.div
                    key={debtor.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-3 rounded-2xl border ${
                      debtor.status === 'paid' 
                        ? 'bg-slate-50/50 border-slate-100/50 opacity-60' 
                        : 'bg-white border-slate-200 shadow-sm'
                    } group relative`}
                  >
                    {editingId === debtor.id ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
                            <input
                              type="text"
                              value={editForm.name || ''}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Monto</label>
                            <input
                              type="number"
                              min="1"
                              value={editForm.amount || ''}
                              onChange={(e) => setEditForm({ ...editForm, amount: parseInt(e.target.value) || 0 })}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs font-medium text-slate-600 mb-1">Detalles</label>
                            <input
                              type="text"
                              value={editForm.note || ''}
                              onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            />
                          </div>
                          {debtor.status === 'paid' && (
                            <div className="col-span-2">
                              <label className="block text-xs font-medium text-slate-600 mb-1">Método de Pago</label>
                              <select
                                value={editForm.paymentMethod || ''}
                                onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value as PaymentMethod })}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                              >
                                {PAYMENT_METHODS.map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end space-x-2 pt-2">
                          <button onClick={cancelEdit} className="px-3 py-1.5 flex items-center text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors">
                            <X className="w-4 h-4 mr-1" /> Cancelar
                          </button>
                          <button onClick={saveEdit} className="px-3 py-1.5 flex items-center text-xs font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors">
                            <Check className="w-4 h-4 mr-1" /> Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className={`font-semibold text-sm truncate ${debtor.status === 'paid' ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                                {debtor.name}
                              </h5>
                              {debtor.status === 'paid' && (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full flex items-center shrink-0">
                                  <CheckCircle className="w-3 h-3 mr-0.5" /> Pagado
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">{formatDate(debtor.date)}</p>
                            {debtor.note && <p className="text-xs text-slate-600 mt-1 italic line-clamp-2">{debtor.note}</p>}
                            
                            {debtor.status === 'paid' && debtor.paymentMethod && (
                              <div className="mt-2 flex flex-wrap items-center text-xs text-slate-400 gap-y-1 gap-x-2">
                                <span className="flex items-center gap-1">
                                  {debtor.paymentMethod === 'Transferencia' ? <Landmark className="w-3 h-3" /> : <Banknote className="w-3 h-3" />}
                                  {debtor.paymentMethod}
                                </span>
                                {debtor.paidDate && (
                                  <span className="md:border-l md:border-slate-200 md:pl-2 flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    Pagado el: {formatDate(debtor.paidDate)}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-right flex flex-col items-end shrink-0 ml-2">
                            <div className={`font-bold text-sm ${debtor.status === 'paid' ? 'text-slate-400' : 'text-indigo-600'}`}>
                              {formatCurrency(debtor.amount)}
                            </div>
                            <div className="flex items-center gap-1 mt-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => startEdit(debtor)}
                                className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"
                                title="Editar"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => onDeleteDebtor(debtor.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {debtor.status === 'pending' && (
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            {payingId === debtor.id ? (
                              <div className="flex items-center gap-2 bg-indigo-50 p-2 rounded-lg">
                                <select
                                  value={paymentMethod}
                                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                                  className="flex-1 text-xs px-2 py-1.5 bg-white border border-indigo-100 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                >
                                  <option value="" disabled>Método de pago</option>
                                  {PAYMENT_METHODS.map(pm => (
                                    <option key={pm} value={pm}>{pm}</option>
                                  ))}
                                </select>
                                <button
                                  onClick={() => handleConfirmPay(debtor.id)}
                                  disabled={!paymentMethod}
                                  className="p-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => { setPayingId(null); setPaymentMethod(''); }}
                                  className="p-1.5 bg-white text-slate-500 rounded-md hover:bg-slate-100 border border-slate-200"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setPayingId(debtor.id)}
                                className="text-xs flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
                              >
                                <Clock className="w-3.5 h-3.5 mr-1" />
                                Marcar como Pagado
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
