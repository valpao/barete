import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { fromEvent, map, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Dish } from '../../models/dish.model';
import { CartService } from '../../services/cart.service';
import { CurrencyService } from '../../services/currency.service';
import { OrderService } from '../../services/order.service';
import { WashoPipe } from '../../pipes/washo.pipe';

// PrimeNG
import { SplitterModule } from 'primeng/splitter';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-order-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SplitterModule,
    ToolbarModule,
    CardModule,
    DataViewModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    ButtonModule,
    TableModule,
    InputNumberModule,
    TagModule,
    DividerModule,
    DialogModule,
    ToastModule,
    ProgressSpinnerModule,
    WashoPipe
  ],
  providers: [MessageService],
  templateUrl: './order-page.component.html',
  styleUrl: './order-page.component.scss'
})
export class OrderPageComponent {
  private destroyRef = inject(DestroyRef);

  // Menu piatti (puoi sostituire con backend/API)
  dishes: Dish[] = [
    { id: 'd1', name: 'Bruschette', priceEur: 2.00, category: 'Antipasti' },
    { id: 'd2', name: 'Pane fritto dorato', priceEur: 2.00, category: 'Antipasti' },
    
    { id: 'd3', name: 'Pennette alla Gegè', priceEur: 11.00, category: 'Primo' },
    { id: 'd4', name: 'Mezze maniche alla boscaiola', priceEur: 10.50, category: 'Primo' },

    { id: 'd5', name: 'Pecora alla cottora', priceEur: 14.00, category: 'Secondo' },
    { id: 'd6', name: 'Trippa', priceEur: 10.00, category: 'Secondo' },
    { id: 'd7', name: 'Straccetti pollo e verdure', priceEur: 11.00, category: 'Secondo' },
    { id: 'd8', name: 'Hamburger', priceEur: 15.00, category: 'Secondo' },
    { id: 'd9', name: 'Hamburger Washo', priceEur: 15.00, category: 'Secondo' },

    { id: 'd10', name: 'Pizza fritta', priceEur: 4.00, category: 'Altro' },
    { id: 'd11', name: 'Pizza fritta Farcita', priceEur: 6.00, category: 'Altro' },
    { id: 'd12', name: 'Patatine fritte', priceEur: 5.00, category: 'Altro' },
    { id: 'd13', name: 'Olive ascolana', priceEur: 6.00, category: 'Altro' },
    { id: 'd14', name: 'Arrosticini x10', priceEur: 13.00, category: 'Altro' },

    { id: 'd20', name: 'Cheesecake', priceEur: 5.00, category: 'Dolce' },

    { id: 'd15', name: 'Acqua', priceEur: 2.00, category: 'Bevande' },
    { id: 'd16', name: 'Vino 1/2', priceEur: 5.00, category: 'Bevande' },
    { id: 'd17', name: 'Vino 1Lt', priceEur: 10.00, category: 'Bevande' },
    { id: 'd18', name: 'Birra 0.3', priceEur: 4.00, category: 'Bevande' },
    { id: 'd19', name: 'Birra 0.5', priceEur: 5.00, category: 'Bevande' }
  ];

  filter = signal('');

  // qty impostata nella lista menu per singolo piatto
  selectedQty = signal<Record<string, number>>({});

  cartItems = signal(this.cart.snapshot);

  // responsive splitter: su schermi più stretti (tablet in verticale) passa a layout verticale
  splitLayout = signal<'horizontal' | 'vertical'>('horizontal');

  // stato ordine confermato
  confirmedOrder = signal<null | {
    id: string;
    createdAt: Date;
    items: any[];
    totalEur: number;
    totalWasho: number;
  }>(null);

  confirming = signal(false);
  showReceiptDialog = signal(false);

  constructor(
    public cart: CartService,
    public currency: CurrencyService,
    private orders: OrderService,
    private messages: MessageService
  ) {
    this.cart.items$.subscribe(items => this.cartItems.set(items));

    fromEvent(window, 'resize').pipe(
      startWith(null),
      map(() => window.innerWidth),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(w => {
      this.splitLayout.set(w >= 992 ? 'horizontal' : 'vertical');
    });
  }

  filteredDishes = computed(() => {
    const q = this.filter().trim().toLowerCase();
    if (!q) return this.dishes;
    return this.dishes.filter(d =>
      d.name.toLowerCase().includes(q) ||
      (d.category ?? '').toLowerCase().includes(q)
    );
  });

  totals = computed(() => this.orders.computeTotals(this.cartItems()));

  qtyFor(dishId: string): number {
    return this.selectedQty()[dishId] ?? 1;
  }

  setQtyFor(dishId: string, qty: number) {
    const safe = Math.max(1, qty || 1);
    this.selectedQty.set({ ...this.selectedQty(), [dishId]: safe });
  }

  addToCart(dish: Dish) {
    const qty = this.qtyFor(dish.id);
    this.cart.add(dish, qty);
   // this.messages.add({ severity: 'success', summary: 'Aggiunto', detail: `${dish.name} x${qty}` });
  }

  updateCartQty(dishId: string, qty: number) {
    this.cart.setQty(dishId, qty);
  }

  removeFromCart(dishId: string) {
    this.cart.remove(dishId);
    this.messages.add({ severity: 'info', summary: 'Rimosso', detail: 'Elemento rimosso dal carrello' });
  }

  clearCart() {
    this.cart.clear();
    this.confirmedOrder.set(null);
    this.messages.add({ severity: 'info', summary: 'Carrello', detail: 'Carrello svuotato' });
  }

  confirmOrder() {
    this.confirming.set(true);
    this.orders.confirm(this.cartItems()).subscribe({
      next: (order) => {
        this.confirming.set(false);
        this.confirmedOrder.set(order);
        this.showReceiptDialog.set(true);
        this.messages.add({ severity: 'success', summary: 'Ordine confermato', detail: order.id });
      },
      error: (err) => {
        this.confirming.set(false);
        this.messages.add({ severity: 'error', summary: 'Errore', detail: err?.message ?? 'Impossibile confermare' });
      }
    });
  }

  resetAfterPrint() {
    this.showReceiptDialog.set(false);
    this.clearCart();
  }

  modificaOrdine(){
    this.showReceiptDialog.set(false);
  }




  printReceipt() {
  const ord = this.confirmedOrder();
  if (!ord) return; // sicurezza: niente ordine, niente stampa

  // Cattura l'HTML da stampare
  const printContents = document.getElementById('printArea')?.innerHTML;
  if (!printContents) return;

  // Crea popup temporaneo
  const popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
  popupWin!.document.open();
  popupWin!.document.write(`
    <html>
      <head>
        <title>Riepilogo ordine #${ord.id}</title>
        <style>
          /* RESET BASE */
          html, body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            color: #222;
            background: #fff;
            line-height: 1.4;
            font-size: 14px;
          }

          /* STILI HEAD */
          .print-head {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            border-bottom: 1px solid #ccc;
            padding-bottom: 8px;
          }

          .print-head .muted {
            color: #666;
            font-size: 0.9em;
          }

          .print-totals {
            text-align: right;
          }

          .print-totals strong {
            font-size: 1.2em;
          }

          /* TABELLA */
          .print-html-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }

          .print-html-table th, .print-html-table td {
            border: 1px solid #ccc;
            padding: 6px 8px;
          }

          .print-html-table th {
            background: #f5f5f5;
          }

          .text-right { text-align: right; }
          .text-center { text-align: center; }

          /* FOOTER */
          .print-footer {
            text-align: center;
            font-size: 0.85em;
            color: #555;
            border-top: 1px solid #ccc;
            padding-top: 10px;
          }

          /* EVITA SPEZZATURE BRUTTE */
          tr, img, svg {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          @page { margin: 10mm; }
        </style>
      </head>
      <body onload="window.print();window.close();">
        ${printContents}
      </body>
    </html>
  `);
  popupWin!.document.close();
}
}
