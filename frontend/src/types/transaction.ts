export interface Transaction {
  id_wallet: string;
  id_transaction: string;
  description: string;
  amount: number;
  reason?: string;
  paymentMethod: string;
  date_created: string;
  date_refunded?: string;
  id_wallet_type: number;
  id_wallet_type_error: number;
  status: string;
}
