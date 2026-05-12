import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Dish } from '../models/dish.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly _items$ = new BehaviorSubject<CartItem[]>([]);
  readonly items$ = this._items$.asObservable();

  get snapshot(): CartItem[] {
    return this._items$.value;
  }

  /** Aggiunge un piatto raggruppandolo per id (incrementa la quantità se già presente) */
  add(dish: Dish, qty = 1): void {
    const items = [...this.snapshot];
    const idx = items.findIndex(i => i.dish.id === dish.id);

    if (idx >= 0) {
      items[idx] = { ...items[idx], qty: items[idx].qty + Math.max(1, qty) };
    } else {
      items.push({ dish, qty: Math.max(1, qty) });
    }

    this._items$.next(items);
  }

  setQty(dishId: string, qty: number): void {
    const safeQty = Math.max(1, qty || 1);
    const items = this.snapshot.map(i =>
      i.dish.id === dishId ? ({ ...i, qty: safeQty }) : i
    );
    this._items$.next(items);
  }

  remove(dishId: string): void {
    this._items$.next(this.snapshot.filter(i => i.dish.id !== dishId));
  }

  clear(): void {
    this._items$.next([]);
  }
}
