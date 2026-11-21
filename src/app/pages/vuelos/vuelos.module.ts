import { IonicModule } from '@ionic/angular/lazy';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VuelosPage } from './vuelos.page';

import { VuelosPageRoutingModule } from './vuelos-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    VuelosPageRoutingModule
  ],
  declarations: [VuelosPage]
})
export class VuelosPageModule {}
