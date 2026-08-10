export type TransactionType = 'income' | 'expense';
export type IncomeCategory = 'Venta salón' | 'Corbatas' | 'Otro';
export type ExpenseCategory = 'Vainas' | 'Chocolate' | 'Manjar' | 'Coco' | 'Nueces' | 'Galletas' | 'Otro';
export type Category = IncomeCategory | ExpenseCategory;
export type PaymentMethod = 'Transferencia' | 'Efectivo';
export type QuantityUnit = 'Unidades' | 'Kilogramos';

export interface Transaction {
  id: string;
  type?: TransactionType; // optional for backwards compatibility
  amount: number;
  category: Category;
  customCategory?: string;
  paymentMethod: PaymentMethod;
  quantity?: number;
  quantityUnit?: QuantityUnit;
  note: string;
  date: string;
}

export interface Debtor {
  id: string;
  name: string;
  amount: number;
  note: string;
  status: 'pending' | 'paid';
  paymentMethod?: PaymentMethod;
  date: string;
  paidDate?: string;
}

export interface SavingsData {
  goal: number;
  transactions: Transaction[];
  debtors?: Debtor[];
}
