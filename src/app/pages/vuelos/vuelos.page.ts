import { Component, OnInit } from '@angular/core';
import { combineLatest, map, Observable, startWith, Subject } from 'rxjs';

import { FlightModalService } from '../../services/flight-modal.service';
import { Flight } from '../../models/flight.model';
import { FlightsService } from '../../services/flights.service';
import { formatAltitude, formatDistance } from '../../utils/geo';

@Component({
  selector: 'app-vuelos',
  templateUrl: 'vuelos.page.html',
  styleUrls: ['vuelos.page.scss'],
  standalone: false,
})
export class VuelosPage implements OnInit {
  readonly formatDistance = formatDistance;
  readonly formatAltitude = formatAltitude;
  readonly status$ = this.flights.status$;
  readonly filtered$: Observable<Flight[]>;
  readonly skeletonRows = [1, 2, 3, 4, 5, 6];
  private readonly term = new Subject<string>();

  constructor(
    private readonly flights: FlightsService,
    private readonly modal: FlightModalService,
  ) {
    this.filtered$ = combineLatest([
      this.flights.flights$,
      this.term.pipe(startWith('')),
    ]).pipe(map(([flights, term]) => this.filter(flights, term)));
  }

  ngOnInit(): void {
    void this.flights.restoreCache().then(() => this.flights.refresh());
  }

  ionViewWillEnter(): void {
    void this.flights.refresh();
  }

  onSearch(event: Event): void {
    const detail = (event as CustomEvent<{ value?: string | null }>).detail;
    this.term.next(detail?.value ?? '');
  }

  async refresh(event: CustomEvent): Promise<void> {
    await this.flights.refresh(true);
    (event.detail as { complete: () => void }).complete();
  }

  open(flight: Flight): void {
    void this.modal.open(flight);
  }

  private filter(flights: Flight[], term: string): Flight[] {
    const query = term.trim().toLowerCase();
    if (!query) {
      return flights;
    }

    return flights.filter(flight =>
      [flight.callsign, flight.registration, flight.hex].some(value =>
        value.toLowerCase().includes(query),
      ),
    );
  }
}
