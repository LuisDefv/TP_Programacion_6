import { Injectable } from '@angular/core';
import { ModalController } from '@ionic/angular/lazy';

import { FlightDetailPage } from '../pages/flight-detail/flight-detail.page';
import { Flight } from '../models/flight.model';

@Injectable({ providedIn: 'root' })
export class FlightModalService {
  constructor(private readonly modalController: ModalController) {}

  async open(flight: Flight): Promise<void> {
    const modal = await this.modalController.create({
      component: FlightDetailPage,
      componentProps: { flight },
      breakpoints: [0, 0.9, 1],
      initialBreakpoint: 0.9,
    });

    await modal.present();
  }
}
