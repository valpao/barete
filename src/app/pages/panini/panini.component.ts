import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { fromEvent, map, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Stand, CatStand } from 'src/app/models/order.model';

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
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { PrintService } from 'src/app/services/print.service';

@Component({
  selector: 'app-panini-page',
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
    ProgressBarModule,
    WashoPipe
  ],
  providers: [MessageService],
  templateUrl: './panini.component.html',
  styleUrl: './panini.component.scss'
})
export class PaniniComponent {
  private destroyRef = inject(DestroyRef);

  // Menu piatti (puoi sostituire con backend/API)
  dishes: Dish[] = [
    { id: 'd5', name: 'Pecora alla cottora', priceEur: 9.00, category: 'PANINI' },
    { id: 'd6', name: 'Hamburger', priceEur: 9.00, category: 'PANINI' },
    { id: 'd7', name: 'Hamburger Washo', priceEur: 12.00, category: 'PANINI' },
  ];

  filter = signal('');
  sessionId = signal(''); // mi serve per modificare l'ordine e mantenere lo stesso id
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
    stand: Stand;
  }>(null);

  confirming = signal(false);
  showReceiptDialog = signal(false);
 private categoryOrder = CatStand;

  constructor(
    public cart: CartService,
    public currency: CurrencyService,
    private orders: OrderService,
    private messages: MessageService,
    private printService: PrintService
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

  getDishesGroupedByCategory(): { [category: string]: Dish[] } {
  const dishes = this.filteredDishes(); // usa la tua funzione di filtro

  // Raggruppa i piatti per categoria
  const grouped: { [category: string]: Dish[] } = {};
  dishes.forEach(d => {
    const cat = d.category ?? 'Altro';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(d);
  });

  // Ordina i piatti all'interno di ogni categoria per nome
  Object.keys(grouped).forEach(cat => {
    grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
  });

  return grouped;
}

// Restituisce le categorie nell'ordine fisso definito
getCategories(): string[] {
  const grouped = this.getDishesGroupedByCategory();
  // Include solo le categorie che esistono nei dati
  return this.categoryOrder.filter(cat => grouped[cat]);
}

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
    this.orders.confirm(this.cartItems(), this.sessionId(), 'PANINI').subscribe({
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
    this.sessionId.set('');
    this.clearCart();
  }

  modificaOrdine(){
    let ordineConfermato = this.confirmedOrder();
    this.sessionId.set(ordineConfermato?.id ? ordineConfermato.id : '');
    this.showReceiptDialog.set(false);
  }



printReceipt() {
  const ord = this.confirmedOrder();
  if (!ord) return; // sicurezza: niente ordine, niente stampa
  this.printService.print(ord);
  }

}
