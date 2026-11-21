import { Component, OnInit } from '@angular/core';
import { combineLatest, map, Observable, startWith, Subject } from 'rxjs';

import { FlightModalService } from '../core/flight-modal.service';
import { Flight } from '../core/flight.model';
import { FlightsService } from '../core/flights.service';
import { formatAltitude, formatDistance } from '../core/geo';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: false,
})
export class Tab2Page implements OnInit {
  readonly formatDistance = formatDistance;
  readonly formatAltitude = formatAltitude;
  readonly status$ = this.flights.status$;
  readonly filtered$: Observable<Flight[]>;
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
    void this.flights.restoreCache();
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
