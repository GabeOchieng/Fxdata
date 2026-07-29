import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { MarketComponent } from './pages/market.component';
import { HireComponent } from './pages/hire.component';
import { RentalsComponent } from './pages/rentals.component';
import { ShopComponent } from './pages/shop.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: "KaziHub — Kenya's Gig Economy Platform" },
  { path: 'market', component: MarketComponent, title: 'Market — KaziHub' },
  { path: 'hire', component: HireComponent, title: 'Hire a Pro — KaziHub' },
  { path: 'rentals', component: RentalsComponent, title: 'Rentals — KaziHub' },
  { path: 'footwear', component: ShopComponent, data: { kind: 'footwear' }, title: 'Footwear — KaziHub' },
  { path: 'merch', component: ShopComponent, data: { kind: 'merch' }, title: 'Merch — KaziHub' },
  { path: '**', redirectTo: '' },
];
