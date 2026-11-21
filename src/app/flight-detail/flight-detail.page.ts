import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { ModalController } from '@ionic/angular/lazy';

import { AdsbService } from '../core/adsb.service';
import { FavoritesService } from '../core/favorites.service';
import { AircraftInfo, Flight, FlightRoute } from '../core/flight.model';
import {
  formatAltitude,
  formatDistance,
  formatSpeed,
  formatTrack,
  formatVerticalRate,
} from '../core/geo';

@Component({
  selector: 'app-flight-detail',
  templateUrl: './flight-detail.page.html',
  styleUrls: ['./flight-detail.page.scss'],
  standalone: false,
})
export class FlightDetailPage implements OnInit {
  @Input() flight!: Flight;

  route: FlightRoute | null = null;
  aircraft: AircraftInfo | null = null;
  isFavorite = false;
  loading = true;

  readonly formatAltitude = formatAltitude;
  readonly formatDistance = formatDistance;
  readonly formatSpeed = formatSpeed;
  readonly formatTrack = formatTrack;
  readonly formatVerticalRate = formatVerticalRate;

  constructor(
    private readonly modalController: ModalController,
    private readonly adsb: AdsbService,
    private readonly favorites: FavoritesService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.favorites.load();
    this.isFavorite = this.favorites.isFavorite(this.flight.hex);

    const [route, aircraft] = await Promise.all([
      this.flight.callsign ? this.adsb.route(this.flight.callsign) : Promise.resolve(null),
      this.adsb.aircraft(this.flight.hex),
    ]);

    this.route = route;
    this.aircraft = aircraft;
    this.loading = false;
    this.cdr.detectChanges();
  }

  get subtitle(): string {
    const parts = [this.flight.registration || this.flight.hex];
    if (this.flight.type) {
      parts.push(this.flight.type);
    }
    return parts.join(' · ');
  }

  get routeLabel(): string {
    if (this.loading) {
      return 'Cargando…';
    }
    if (!this.route) {
      return 'Sin datos de ruta';
    }
    return `${this.route.originIata || '?'} → ${this.route.destinationIata || '?'}`;
  }

  get routeCities(): string {
    if (!this.route || (!this.route.originCity && !this.route.destinationCity)) {
      return '';
    }
    return `${this.route.originCity || '—'} → ${this.route.destinationCity || '—'}`;
  }

  get airline(): string {
    return this.route?.airline ?? '';
  }

  get aircraftLabel(): string {
    if (!this.aircraft) {
      return '';
    }
    return `${this.aircraft.manufacturer} ${this.aircraft.model}`.trim();
  }

  get aircraftNote(): string {
    if (!this.aircraft) {
      return '';
    }
    const registration = this.aircraft.registration || this.flight.registration;
    return this.aircraft.owner ? `${registration} · ${this.aircraft.owner}` : registration;
  }

  async toggleFavorite(): Promise<void> {
    this.isFavorite = await this.favorites.toggle(this.flight);
    await Haptics.impact({ style: ImpactStyle.Light }).catch(() => undefined);
  }

  close(): void {
    void this.modalController.dismiss();
  }
}
