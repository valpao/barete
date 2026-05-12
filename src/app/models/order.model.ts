import { CartItem } from './cart-item.model';

export interface Order {
  id: string;
  createdAt: Date;
  items: CartItem[];
  totalEur: number;
  totalWasho: number;
  status: 'DRAFT' | 'CONFIRMED';
}
