import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VuelosPage } from './vuelos.page';

const routes: Routes = [
  {
    path: '',
    component: VuelosPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VuelosPageRoutingModule {}
