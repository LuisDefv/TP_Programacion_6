import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'mapa',
        loadChildren: () => import('../pages/mapa/mapa.module').then(m => m.MapaPageModule)
      },
      {
        path: 'vuelos',
        loadChildren: () => import('../pages/vuelos/vuelos.module').then(m => m.VuelosPageModule)
      },
      {
        path: 'favoritos',
        loadChildren: () => import('../pages/favoritos/favoritos.module').then(m => m.FavoritosPageModule)
      },
      {
        path: '',
        redirectTo: '/tabs/mapa',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/mapa',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
