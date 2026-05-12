import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  /** 1 WASHO = 1.5 EUR */
  readonly EUR_PER_WASHO = 1.5;

  eurToWasho(eur: number): number {
    if (!eur) return 0;
    return eur / this.EUR_PER_WASHO;
  }

  washoToEur(washo: number): number {
    if (!washo) return 0;
    return washo * this.EUR_PER_WASHO;
  }

  round2(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
  }
}
