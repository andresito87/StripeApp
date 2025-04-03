export interface Transaction {
  id_wallet: string;
  id_transaction: string;
  description: string;
  amount: number;
  date_created: string;
  date_refunded?: string;
  id_wallet_type: number;
  status: string;
}
