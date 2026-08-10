import { motion } from 'motion/react';
import { Edit2, Check } from 'lucide-react';
import { useState } from 'react';
import { formatCurrency } from '../utils';

interface DashboardProps {
  total: number;
  totalEfectivo: number;
  totalTransferencia: number;
  goal: number;
  onUpdateGoal: (newGoal: number) => void;
}

export function Dashboard({ total, totalEfectivo, totalTransferencia, goal, onUpdateGoal }: DashboardProps) {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(goal.toString());

  const progress = Math.max(0, (total / (goal || 1)) * 100);
  const scaleGoal = Math.max(goal, total, 1);
  const widthEfectivo = Math.max(0, (totalEfectivo / scaleGoal) * 100);
  const widthTransferencia = Math.max(0, (totalTransferencia / scaleGoal) * 100);

  const handleSaveGoal = () => {
    const parsed = parseInt(tempGoal, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateGoal(parsed);
    } else {
      setTempGoal(goal.toString());
    }
    setIsEditingGoal(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-orange-100 relative overflow-hidden"
    >
      {/* Decorative background accent */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-teal-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="relative z-10 text-center mb-8">
        <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Total Recaudado</h2>
        <motion.div 
          key={total}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-4xl sm:text-5xl font-bold text-slate-800 tracking-tight"
        >
          {formatCurrency(total)}
        </motion.div>
      </div>

      <div className="relative z-10">
        <div className="flex justify-between items-end mb-2 text-sm">
          <span className="font-semibold text-teal-700">{progress.toFixed(1)}% de la meta</span>
          <div className="flex items-center text-slate-500">
            {isEditingGoal ? (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={tempGoal}
                  onChange={(e) => setTempGoal(e.target.value)}
                  className="w-24 px-2 py-1 text-right text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveGoal()}
                />
                <button 
                  onClick={handleSaveGoal}
                  className="p-1.5 bg-teal-50 text-teal-600 rounded-full hover:bg-teal-100 transition-colors"
                >
                  <Check size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>{formatCurrency(goal)}</span>
                <button 
                  onClick={() => setIsEditingGoal(true)}
                  className="p-1 text-slate-400 hover:text-orange-500 transition-colors"
                  aria-label="Editar meta"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner flex">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${widthEfectivo}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-orange-400 to-rose-500"
          />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${widthTransferencia}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-violet-500 to-indigo-600"
          />
        </div>

        <div className="flex justify-center items-center gap-6 mt-5 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 shadow-sm" />
            Efectivo ({formatCurrency(totalEfectivo)})
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm" />
            Transferencia ({formatCurrency(totalTransferencia)})
          </div>
        </div>
      </div>
    </motion.div>
  );
}
