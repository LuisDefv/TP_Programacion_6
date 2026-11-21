import { Component } from '@angular/core';

import { FavoritesService } from '../core/favorites.service';
import { FlightModalService } from '../core/flight-modal.service';
import { Flight, SavedFlight } from '../core/flight.model';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page {
  readonly favorites$ = this.favorites.favorites$;

  constructor(
    private readonly favorites: FavoritesService,
    private readonly modal: FlightModalService,
  ) {}

  open(saved: SavedFlight): void {
    void this.modal.open(this.toFlight(saved));
  }

  remove(hex: string): void {
    void this.favorites.remove(hex);
  }

  private toFlight(saved: SavedFlight): Flight {
    return {
      hex: saved.hex,
      callsign: saved.callsign,
      registration: saved.registration,
      type: saved.type,
      lat: 0,
      lon: 0,
      altitudeFt: null,
      speedKt: null,
      track: null,
      verticalRate: null,
      distanceKm: -1,
    };
  }
}
