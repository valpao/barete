import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { CurrencyService } from './currency.service';
import { Order, Stand } from '../models/order.model';
import { HttpClient } from "@angular/common/http";
import { map, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly apiUrl = 'https://www.valeriopaolelli.it/washo/script/save_order.php';

  constructor(private currency: CurrencyService, private readonly http: HttpClient) {}

  computeTotals(items: CartItem[]) {
    const totalEur = (items ?? []).reduce((sum, it) => sum + it.dish.priceEur * it.qty, 0);
    const totalWasho = this.currency.eurToWasho(totalEur);
    return {
      totalEur: this.currency.round2(totalEur),
      totalWasho: this.currency.round2(totalWasho)
    };
  }

  confirm(items: CartItem[], sessionId: string, stand: Stand): Observable<Order> {
    if (!items?.length) {
      return throwError(() => new Error('Carrello vuoto'));
    }

    const totals = this.computeTotals(items);
    const order: Order = {
      id: sessionId || this.makeId(),
      createdAt: new Date(),
      items: items.map(x => ({ ...x })),
      totalEur: totals.totalEur,
      totalWasho: totals.totalWasho,
      stand: stand
    };
    console.log(order)
    // Simula chiamata backend OK
   // return of(order).pipe(delay(700));
    return this.http.post<any>(this.apiUrl, order).pipe(
      map(res => {
        if (!res.success) {
          throw new Error(res.error || 'Operazione fallita');
        }

        // restituisci sempre il modello frontend
        return order;
      }),
      catchError(err => {
        const message =
          err?.error?.error ||
          err?.message ||
          'Errore sconosciuto';

        return throwError(() => new Error(message));
      })
    );

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
