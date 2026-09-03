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
  /*
  const formatId = (id: string, chunk = 18) =>
    id.match(new RegExp(`.{1,${chunk}}`, 'g')) || [];

  formatId(order.id, 18).forEach(part => {
    lines.push(part);
  });
 */

  lines.push(order.id);

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
        .padStart(6, ' ');

        lines.push(`${qty}${name}${price}`);
      });

    });


  // Totale unico preso dall'ordine
  lines.push('');
  lines.push('------------------------');

  lines.push(
    `TOT Washo:${order.totalWasho.toFixed(0).padStart(14, ' ')}`
  );

  lines.push(
    `TOT EUR:${order.totalEur.toFixed(2).padStart(16, ' ')}`
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



private formatDishName(name: string, maxLength = 15): string {

  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!words.length) {
    return ''.padEnd(maxLength, ' ');
  }

  // Parole che normalmente aggiungono poca informazione
  // e che possiamo eliminare quando lo spazio è limitato.
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
    'e',
    'in',
    'per'
  ]);

  const significantWords = words.filter(
    word => !ignoredWords.has(word.toLowerCase())
  );

  // Se il nome entra già nello spazio disponibile,
  // non lo modifichiamo.
  if (name.length <= maxLength) {
    return name.padEnd(maxLength, ' ');
  }

  /*
   * Abbrevia una parola mantenendo il massimo
   * delle informazioni possibili.
   *
   * Esempi:
   * Hamburger -> Hamburge.
   * fritto    -> fritt.
   * farcito   -> farcit.
   */
  const abbreviate = (word: string, length: number): string => {

    if (word.length <= length) {
      return word;
    }

    if (length <= 1) {
      return word.substring(0, length);
    }

    return word.substring(0, length - 1) + '.';
  };

  /*
   * Costruisce una descrizione composta da due parole,
   * cercando di dare più spazio possibile alla prima
   * e alla seconda.
   *
   * Esempi:
   *
   * Hamburger di pecora
   * -> Hambur. pecora
   *
   * Hamburger di manzo
   * -> Hambur. manzo
   *
   * Questo mantiene distinguibile la variante.
   */
  if (significantWords.length >= 2) {

    const first = significantWords[0];
    const last = significantWords[significantWords.length - 1];

    // Partiamo dando una buona quantità di spazio
    // alla prima parola e alla variante finale.
    let firstLength = Math.min(first.length, 8);
    let lastLength = Math.min(last.length, 8);

    // Riduciamo fino a rientrare nei 15 caratteri.
    while (firstLength + 1 + lastLength > maxLength) {

      // Cerchiamo di preservare la parola finale,
      // che spesso identifica la variante del piatto.
      if (firstLength > 5) {
        firstLength--;
      }
      else if (lastLength > 5) {
        lastLength--;
      }
      else {
        break;
      }
    }

    const result =
      `${abbreviate(first, firstLength)} ${abbreviate(last, lastLength)}`;

    if (result.length <= maxLength) {
      return result.padEnd(maxLength, ' ');
    }
  }

  /*
   * Se ci sono più parole significative,
   * cerchiamo di utilizzare più parole possibili
   * anziché limitarci solamente alla prima e all'ultima.
   *
   * Esempio:
   *
   * Pane fritto dorato farcito
   * -> Pane frit. dorato
   */

  let result = '';

  for (const word of significantWords) {

    // Prima proviamo a inserire la parola completa.
    const candidate = result
      ? `${result} ${word}`
      : word;

    if (candidate.length <= maxLength) {
      result = candidate;
      continue;
    }

    /*
     * Se non entra completa, proviamo ad abbreviare
     * la parola in modo da sfruttare lo spazio restante.
     */
    const remaining = maxLength - result.length - (result ? 1 : 0);

    if (remaining >= 4) {

      const abbreviatedWord = abbreviate(word, remaining);

      const candidateAbbreviated = result
        ? `${result} ${abbreviatedWord}`
        : abbreviatedWord;

      if (candidateAbbreviated.length <= maxLength) {
        result = candidateAbbreviated;
      }
    }

    break;
  }

  /*
   * Ultimo fallback:
   * se per qualche motivo il risultato non è ancora
   * abbastanza informativo, manteniamo almeno la prima
   * parola significativa.
   */
  if (!result) {
    result = abbreviate(significantWords[0] ?? words[0], maxLength);
  }

  return result
    .substring(0, maxLength)
    .padEnd(maxLength, ' ');
}


}