import { CartItem } from './cart-item.model';

export type Stand =
  |'CASSA'
  |'PRIMI'
  |'SECONDI'
  |'ARROSTICINI'
  |'FRITTI'
  |'DOLCE'
  |'BEVANDE'

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
  'PRIMI',
  'SECONDI',
  'ARROSTICINI',
  'FRITTI',
  'DOLCE',
  'BEVANDE',
] as const;
