import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular/lazy';

import { FlightDetailPage } from './flight-detail.page';

@NgModule({
  imports: [CommonModule, IonicModule],
  declarations: [FlightDetailPage],
  exports: [FlightDetailPage],
})
export class FlightDetailModule {}
