import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyService } from '../services/currency.service';

@Pipe({ name: 'washoval', standalone: true })
export class WashoPipe implements PipeTransform {
  constructor(private currency: CurrencyService) {}

  transform(eur: number): string {
    const w = this.currency.round2(this.currency.eurToWasho(eur));
    return `${w.toFixed(0)} W`;
  }
}
