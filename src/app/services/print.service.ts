// receipt.service.ts
import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';


@Injectable({ providedIn: 'root' })
export class PrintService {

print(order: Order) {

  const printContents = this.formatReceiptsByCategory(order);

  const newWindow = window.open(
    '',
    '_blank',
    'top=0,left=0,height=100%,width=auto'
  );

  if (newWindow) {

    newWindow.document.write(`
      <html>
        <head>
          <title>Stampa Ordine</title>

          <style>

            @page {
              size: 54mm auto;
              margin: 0;
            }

            html,
            body {
              width: 54mm;
              margin: 0;
              padding: 0;
              font-family: 'Courier New', monospace;
              background: #fff;
            }

            body {
              padding: 2mm;
            }

            .receipt {
              width: 50mm;
              white-space: pre-wrap;
              overflow: hidden;
            }


            pre {
              margin: 0;
              font-size: 10px;
              line-height: 1.2;
              font-family: 'Courier New', monospace;
              white-space: pre-wrap;
              word-break: break-word;
            }

          </style>
        </head>

        <body>
          ${printContents}
        </body>
      </html>
    `);

    newWindow.document.close();

    newWindow.focus();

    setTimeout(() => {
      newWindow.print();
      newWindow.close();
    }, 300);
  }
}



private formatReceiptsByCategory_OLD(order: Order): string {

  // Raggruppa per categoria
  const groupedItems = order.items.reduce((acc, item) => {

    const category = item.dish.category;

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(item);

    return acc;

  }, {} as Record<string, typeof order.items>);


  // Genera uno scontrino per categoria
  return Object.entries(groupedItems)
    .map(([category, items]) => {

      const lines: string[] = [];

      const date = new Date(order.createdAt)
        .toLocaleString('it-IT');

      let total = 0;

      lines.push('========================');
      lines.push(`   ${category}`);
      lines.push('========================');


      const formatId = (id: string, chunk = 18) =>
        id.match(new RegExp(`.{1,${chunk}}`, 'g')) || [];

      formatId(order.id, 18).forEach(part => {
        lines.push(part);
      });

      lines.push(date);

     // lines.push(`Stand:${order.stand}`);

      lines.push('------------------------');

      lines.push('QTA DESCR.         EUR');

      lines.push('------------------------');


      items.forEach(item => {

        const qty = item.qty
          .toString()
          .padEnd(3, ' ');

        // max 12 caratteri
        const name = item.dish.name
          .substring(0, 12)
          .padEnd(12, ' ');

        const itemTotal = item.dish.priceEur * item.qty;

        const price = itemTotal
          .toFixed(2)
          .padStart(7, ' ');

        total += itemTotal;

        lines.push(`${qty}${name}${price}`);
      });

      lines.push('------------------------');

      lines.push(
        `TOT EUR:${total.toFixed(2).padStart(11, ' ')}`
      );

      lines.push('========================');

      lines.push(' GRAZIE PER L ORDINE');

      lines.push('========================');


      return `
        <div class="receipt">
          <pre>${lines.join('\n')}</pre>
        </div>
      `;

    })
    .join('');
}

private formatReceiptsByCategory(order: Order): string {

  // Raggruppa per categoria
  const groupedItems = order.items.reduce((acc, item) => {

    const category = item.dish.category;

    if (!acc[category]) {
      acc[category] = [];
    }

    acc[category].push(item);

    return acc;

  }, {} as Record<string, typeof order.items>);


  const lines: string[] = [];

  const date = new Date(order.createdAt)
    .toLocaleString('it-IT');


  // Intestazione unica
  lines.push('========================');
  lines.push('        ORDINE');
  lines.push('========================');


  // ID ordine
  const formatId = (id: string, chunk = 18) =>
    id.match(new RegExp(`.{1,${chunk}}`, 'g')) || [];

  formatId(order.id, 18).forEach(part => {
    lines.push(part);
  });

  lines.push(date);

  lines.push('------------------------');

    lines.push('QTA DESCR.         EUR');

  // Stampa le categorie
  Object.entries(groupedItems)
    .forEach(([category, items]) => {

      lines.push('');
      lines.push(`   ${category}`);
      lines.push('------------------------');


      items.forEach(item => {

        const qty = item.qty
          .toString()
          .padEnd(3, ' ');

        const name = item.dish.name
          .substring(0, 12)
          .padEnd(12, ' ');

        const itemTotal = item.dish.priceEur * item.qty;

        const price = itemTotal
          .toFixed(2)
          .padStart(7, ' ');

        lines.push(`${qty}${name}${price}`);
      });

    });


  // Totale unico preso dall'ordine
  lines.push('');
  lines.push('------------------------');

  lines.push(
    `TOT Washo:${order.totalWasho.toFixed(2).padStart(11, ' ')}`
  );

  lines.push(
    `TOT EUR:&nbsp;&nbsp;${order.totalEur.toFixed(2).padStart(11, ' ')}`
  );

  lines.push('========================');

  lines.push(' GRAZIE PER L ORDINE');

  lines.push('========================');


  // Un solo scontrino
  return `
    <div class="receipt">
      <pre>${lines.join('\n')}</pre>
    </div>
  `;
}
}