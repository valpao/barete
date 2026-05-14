import { CartItem } from './cart-item.model';

export type Stand =
| 'CASSA'
| 'BRUSCHETTE'
| 'BEVANDE'
| 'PANINI'
| 'PRIMI'
| 'PROLOCO'
| 'ARROSTICINI'
| 'BAR';

export interface Order {
  id: string;
  createdAt: Date;
  items: CartItem[];
  totalEur: number;
  totalWasho: number;
  stand: Stand;
}

export const CatStand = [
  'CASSA',
  'BRUSCHETTE',
  'BEVANDE',
  'PANINI',
  'PRIMI',
  'PROLOCO',
  'ARROSTICINI',
  'BAR'
] as const;
