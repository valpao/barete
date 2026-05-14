import { Routes } from '@angular/router';
import { OrderPageComponent } from './pages/order-page/order-page.component';
import { BruschetteComponent } from './pages/bruschette/bruschette.component';
import { BevandeComponent } from './pages/bevande/bevande.component';
import { PaniniComponent } from './pages/panini/panini.component';
import { PrimiComponent } from './pages/primi/primi.component';
import { ProlocoComponent } from './pages/proloco/proloco.component';
import { BarComponent } from './pages/bar/bar.component';
import { ArrosticiniComponent } from './pages/arrosticini/arrosticini.component';

export const routes: Routes = [
  { path: '', component: OrderPageComponent },
  { path: 'bruschette', component: BruschetteComponent },
  { path: 'bevande', component: BevandeComponent },
  { path: 'panini', component: PaniniComponent },
  { path: 'primi', component: PrimiComponent },
  { path: 'proloco', component: ProlocoComponent },
  { path: 'bar', component: BarComponent },
  { path: 'arrosticini', component: ArrosticiniComponent },

  { path: '**', redirectTo: '' }
];
