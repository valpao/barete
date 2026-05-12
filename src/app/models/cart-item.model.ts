import { Dish } from './dish.model';

export interface CartItem {
  dish: Dish;
  qty: number;
}
