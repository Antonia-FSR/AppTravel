export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const formatShortDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short'
  }).format(date);
};

export const INCOME_CATEGORIES = [
  'Venta salón',
  'Corbatas',
  'Otro',
] as const;

export const EXPENSE_CATEGORIES = [
  'Vainas',
  'Chocolate',
  'Manjar',
  'Coco',
  'Nueces',
  'Galletas',
  'Otro',
] as const;

export const CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES] as const;

export const QUANTITY_UNITS = [
  'Unidades',
  'Kilogramos',
] as const;

export const PAYMENT_METHODS = [
  'Transferencia',
  'Efectivo',
] as const;

export const exportDataToExcel = async (transactions: any[], debtors: any[]) => {
  const xlsx = await import('xlsx');
  
  const txData = transactions.map(tx => ({
    Fecha: formatDate(tx.date),
    Tipo: tx.type === 'expense' ? 'Gasto' : 'Ingreso',
    Monto: tx.amount,
    Categoría: tx.category === 'Otro' && tx.customCategory ? tx.customCategory : tx.category,
    'Método de Pago': tx.paymentMethod,
    Cantidad: tx.quantity ? `${tx.quantity} ${tx.quantityUnit || ''}` : '',
    Detalles: tx.note || ''
  }));

  const debtorsData = debtors.map(d => ({
    Fecha: formatDate(d.date),
    Nombre: d.name,
    Monto: d.amount,
    Estado: d.status === 'paid' ? 'Pagado' : 'Pendiente',
    'Método de Pago': d.paymentMethod || '',
    'Fecha de Pago': d.paidDate ? formatDate(d.paidDate) : '',
    Detalles: d.note || ''
  }));

  const wb = xlsx.utils.book_new();
  
  const wsTx = xlsx.utils.json_to_sheet(txData);
  xlsx.utils.book_append_sheet(wb, wsTx, 'Movimientos');

  const wsDebtors = xlsx.utils.json_to_sheet(debtorsData);
  xlsx.utils.book_append_sheet(wb, wsDebtors, 'Deudores');

  xlsx.writeFile(wb, `Ahorros_Viaje_${new Date().toISOString().split('T')[0]}.xlsx`);
};
