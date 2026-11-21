import { Component, OnInit } from '@angular/core';

import { FavoritesService } from '../../services/favorites.service';
import { FlightModalService } from '../../services/flight-modal.service';
import { Flight, SavedFlight } from '../../models/flight.model';

@Component({
  selector: 'app-favoritos',
  templateUrl: 'favoritos.page.html',
  styleUrls: ['favoritos.page.scss'],
  standalone: false,
})
export class FavoritosPage implements OnInit {
  readonly favorites$ = this.favorites.favorites$;

  constructor(
    private readonly favorites: FavoritesService,
    private readonly modal: FlightModalService,
  ) {}

  ngOnInit(): void {
    void this.favorites.load();
  }

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
