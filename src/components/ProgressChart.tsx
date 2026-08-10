import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { Transaction, Debtor } from '../types';
import { formatCurrency, formatShortDate } from '../utils';

interface ProgressChartProps {
  transactions: Transaction[];
  debtors: Debtor[];
}

export function ProgressChart({ transactions, debtors }: ProgressChartProps) {
  const chartData = useMemo(() => {
    const events: { date: Date; amount: number; type: 'income' | 'expense' }[] = [];

    transactions.forEach(tx => {
      events.push({
        date: new Date(tx.date),
        amount: tx.amount,
        type: tx.type || 'income'
      });
    });

    debtors.filter(d => d.status === 'paid' && d.paidDate).forEach(d => {
      events.push({
        date: new Date(d.paidDate!),
        amount: d.amount,
        type: 'income'
      });
    });

    // Sort chronologically
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    const groupedByDay = new Map<string, number>();

    events.forEach(ev => {
      const dayKey = ev.date.toISOString().split('T')[0];
      const netAmount = ev.type === 'expense' ? -ev.amount : ev.amount;
      
      const current = groupedByDay.get(dayKey) || 0;
      groupedByDay.set(dayKey, current + netAmount);
    });

    const sortedDays = Array.from(groupedByDay.keys()).sort();
    const dataPoints: { date: string; dateStr: string; total: number; amount: number }[] = [];
    
    if (sortedDays.length > 0) {
      const firstDate = new Date(sortedDays[0]);
      firstDate.setDate(firstDate.getDate() - 1);
      dataPoints.push({
        date: firstDate.toISOString().split('T')[0],
        dateStr: formatShortDate(firstDate.toISOString()),
        total: 0,
        amount: 0
      });
    }

    let cumulative = 0;
    sortedDays.forEach(day => {
      const netAmount = groupedByDay.get(day) || 0;
      cumulative += netAmount;
      dataPoints.push({
        date: day,
        dateStr: formatShortDate(new Date(day + 'T12:00:00').toISOString()),
        total: cumulative,
        amount: netAmount
      });
    });

    return dataPoints;
  }, [transactions, debtors]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-orange-100 mt-8 mb-8">
      <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
        <TrendingUp className="mr-2 text-orange-500" size={20} />
        Progreso en el Tiempo
      </h3>
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="dateStr" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toLocaleString('es-CL')}`}
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: number) => [formatCurrency(value), 'Total Recaudado']}
              labelFormatter={(label) => label}
              contentStyle={{ borderRadius: '12px', border: '1px solid #ffedd5', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Area 
              type="monotone" 
              dataKey="total" 
              stroke="#f97316" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorTotal)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
