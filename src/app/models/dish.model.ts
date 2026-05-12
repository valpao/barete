export interface Dish {
  id: string;
  name: string;
  priceEur: number;
  category?: 'Primo' | 'Secondo' | 'Altro';
}
