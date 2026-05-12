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
  // timestamp in base36 (compatto e ordinabile)
  const ts = Date.now().toString(36).toUpperCase();

  // random forte (crypto, NON Math.random)
  const array = new Uint8Array(6); // 6 byte = 48 bit
  crypto.getRandomValues(array);

  const rnd = Array.from(array)
    .map(b => b.toString(36).padStart(2, '0'))
    .join('')
    .toUpperCase();

  return `ORD-${ts}-${rnd}`;
}

}
