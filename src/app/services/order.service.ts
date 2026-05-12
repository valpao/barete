import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { CurrencyService } from './currency.service';
import { Order } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private currency: CurrencyService) {}

  computeTotals(items: CartItem[]) {
    const totalEur = (items ?? []).reduce((sum, it) => sum + it.dish.priceEur * it.qty, 0);
    const totalWasho = this.currency.eurToWasho(totalEur);
    return {
      totalEur: this.currency.round2(totalEur),
      totalWasho: this.currency.round2(totalWasho)
    };
  }

  confirm(items: CartItem[]): Observable<Order> {
    if (!items?.length) {
      return throwError(() => new Error('Carrello vuoto'));
    }

    const totals = this.computeTotals(items);
    const order: Order = {
      id: this.makeId(),
      createdAt: new Date(),
      items: items.map(x => ({ ...x })),
      totalEur: totals.totalEur,
      totalWasho: totals.totalWasho,
      status: 'CONFIRMED'
    };

    // Simula chiamata backend OK
    return of(order).pipe(delay(700));
  }

  private makeId(): string {
    const ts = Date.now().toString(36).toUpperCase();
    const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `ORD-${ts}-${rnd}`;
  }
}
