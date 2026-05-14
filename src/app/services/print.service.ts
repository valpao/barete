// receipt.service.ts
import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';


@Injectable({ providedIn: 'root' })
export class PrintService {

  print(order: Order) {
    const printContents = this.formatReceipt(order);
    const newWindow = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    
    if (newWindow) {
      newWindow.document.write(`<pre>${printContents}</pre>`);
      newWindow.document.close();
      newWindow.focus();
      newWindow.print();
      newWindow.close();
    }
  }

  private formatReceipt(order: Order): string {
    let lines = [];
    lines.push('===============================');
    lines.push('        RICEVUTA ORDINE        ');
    lines.push('===============================');
    lines.push(`ID Ordine: ${order.id}`);
    lines.push(`Data: ${new Date(order.createdAt).toLocaleString()}`);
    lines.push(`Stand: ${order.stand}`);
    lines.push('-------------------------------');
    lines.push('QTY  DESCRIZIONE           EURO');
    lines.push('-------------------------------');

    order.items.forEach(item => {
      const qty = item.qty.toString().padEnd(4, ' ');
      const name = item.dish.name.padEnd(20, ' ');
      const price = (item.dish.priceEur * item.qty).toFixed(2).padStart(5, ' ');
      lines.push(`${qty}${name}${price}`);
    });

    lines.push('-------------------------------');
    lines.push(`TOTALE EURO:       ${order.totalEur.toFixed(2)}`);
    lines.push(`TOTALE WASHO:      ${order.totalWasho.toFixed(2)}`);
    lines.push('===============================');
    lines.push('       GRAZIE PER L\'ORDINE     ');
    lines.push('===============================');

    return lines.join('\n');
  }
}