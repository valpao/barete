// receipt.service.ts
import { Injectable } from '@angular/core';
import { Order } from '../models/order.model';
import { CurrencyService } from './currency.service';

@Injectable({ providedIn: 'root' })
export class PrintService {

   constructor(
    private currencyService: CurrencyService
  ) {}


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

    lines.push('QTA DESCR.         WASHO');

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

          /*
        const name = item.dish.name
          .substring(0, 12)
          .padEnd(12, ' ');
*/
        const name = this.formatDishName(item.dish.name);
/*
        const itemTotal = item.dish.priceEur * item.qty;

        const price = itemTotal
          .toFixed(2)
          .padStart(7, ' ');
*/

      const itemTotalEur = item.dish.priceEur * item.qty;

      const itemTotalWasho = this.currencyService.round2(
        this.currencyService.eurToWasho(itemTotalEur)
      );

      const price = itemTotalWasho
        .toFixed(0)
        .padStart(7, ' ');

        lines.push(`${qty}${name}${price}`);
      });

    });


  // Totale unico preso dall'ordine
  lines.push('');
  lines.push('------------------------');

  lines.push(
    `TOT Washo:${order.totalWasho.toFixed(2).padStart(12, ' ')}`
  );

  lines.push(
    `TOT EUR:${order.totalEur.toFixed(2).padStart(14, ' ')}`
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


private formatDishName(name: string, maxLength = 12): string {

  const words = name
    .trim()
    .split(/\s+/);

  if (!words.length) {
    return ''.padEnd(maxLength, ' ');
  }

  // Parole che normalmente non aggiungono
  // informazione significativa alla descrizione.
  const ignoredWords = new Set([
    'di',
    'del',
    'della',
    'dei',
    'degli',
    'delle',
    'da',
    'a',
    'al',
    'alla',
    'alle',
    'ai',
    'agli',
    'con',
    'e'
  ]);

  // Abbreviazione intelligente di una singola parola.
  const abbreviate = (word: string, length: number): string => {

    if (word.length <= length) {
      return word;
    }

    if (length <= 1) {
      return word.substring(0, length);
    }

    return word.substring(0, length - 1) + '.';
  };


  // Se il nome ci sta già, non tocchiamo nulla.
  if (name.length <= maxLength) {
    return name.padEnd(maxLength, ' ');
  }


  const significantWords = words.filter(
    word => !ignoredWords.has(word.toLowerCase())
  );


  /*
   * Strategia:
   *
   * - prima parola: identifica il prodotto
   * - ultima parola: spesso identifica la variante
   *
   * Esempio:
   * Hamburger di pecora
   * → Hamburger + pecora
   *
   * Pane fritto dorato farcito
   * → Pane + farcito
   */


  if (significantWords.length >= 2) {

    const first = significantWords[0];
    const last = significantWords[significantWords.length - 1];


    // Caso ideale: prima parola + ultima parola
    let firstLength = Math.min(first.length, 5);
    let lastLength = Math.min(last.length, 5);

    while (firstLength + 1 + lastLength > maxLength) {

      // Riduciamo prima la prima parola
      if (firstLength > 3) {
        firstLength--;
      }
      else if (lastLength > 3) {
        lastLength--;
      }
      else {
        break;
      }
    }


    let result =
      `${abbreviate(first, firstLength)} ${abbreviate(last, lastLength)}`;


    if (result.length <= maxLength) {
      return result.padEnd(maxLength, ' ');
    }
  }


  /*
   * Seconda strategia:
   * prova a costruire la descrizione utilizzando
   * tutte le parole significative.
   */

  const abbreviated = significantWords.map(word =>
    abbreviate(word, 4)
  );

  let result = abbreviated[0] ?? '';


  for (let i = 1; i < abbreviated.length; i++) {

    const candidate = `${result} ${abbreviated[i]}`;

    if (candidate.length <= maxLength) {
      result = candidate;
    }
  }


  if (result.length > maxLength) {
    result = result.substring(0, maxLength);
  }


  return result.padEnd(maxLength, ' ');
}
}