import { AfterViewInit, Component, OnDestroy } from '@angular/core';
import * as L from 'leaflet';
import { Subscription } from 'rxjs';

import { AdsbService } from '../core/adsb.service';
import { FlightModalService } from '../core/flight-modal.service';
import { Flight, FlightRoute } from '../core/flight.model';
import { FlightsService } from '../core/flights.service';
import { LocationService } from '../core/location.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: false,
})
export class Tab1Page implements AfterViewInit, OnDestroy {
  readonly flights$ = this.flights.flights$;
  readonly status$ = this.flights.status$;
  refreshing = false;

  private map?: L.Map;
  private readonly aircraftLayer = L.layerGroup();
  private readonly routeLayer = L.layerGroup();
  private readonly markers = new Map<string, L.Marker>();
  private readonly markerTracks = new Map<string, number>();
  private readonly markerBands = new Map<string, string>();
  private readonly routeCache = new Map<string, FlightRoute | null>();
  private subscription?: Subscription;
  private timer?: ReturnType<typeof setInterval>;
  private moveTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly flights: FlightsService,
    private readonly location: LocationService,
    private readonly adsb: AdsbService,
    private readonly modal: FlightModalService,
  ) {}

  async ngAfterViewInit(): Promise<void> {
    const center = await this.location.current();
    this.flights.setCenter(center.lat, center.lon);

    this.map = L.map('map', { zoomControl: false }).setView([center.lat, center.lon], 7);
    L.control.zoom({ position: 'bottomright' }).addTo(this.map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; OpenStreetMap',
    }).addTo(this.map);

    L.circleMarker([center.lat, center.lon], {
      radius: 6,
      color: '#ffffff',
      weight: 2,
      fillColor: '#1f6feb',
      fillOpacity: 1,
    }).addTo(this.map);

    this.aircraftLayer.addTo(this.map);
    this.routeLayer.addTo(this.map);
    this.subscription = this.flights.flights$.subscribe(flights => this.render(flights));
    this.map.on('moveend', () => this.onMapMove());

    await this.flights.restoreCache();
    await this.refresh();
    this.startTimer();

    setTimeout(() => this.map?.invalidateSize(), 250);
  }

  ionViewWillEnter(): void {
    this.map?.invalidateSize();
    this.startTimer();
  }

  ionViewWillLeave(): void {
    this.stopTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
    if (this.moveTimer) {
      clearTimeout(this.moveTimer);
    }
    this.subscription?.unsubscribe();
    this.map?.remove();
  }

  async refresh(force = false): Promise<void> {
    this.refreshing = true;
    await this.flights.refresh(force);
    this.refreshing = false;
  }

  private render(flights: Flight[]): void {
    const seen = new Set<string>();

    for (const flight of flights) {
      const key = flight.hex || `${flight.lat},${flight.lon}`;
      seen.add(key);

      const marker = this.markers.get(key);
      if (marker) {
        marker.setLatLng([flight.lat, flight.lon]);
        const track = flight.track ?? 0;
        const band = this.altitudeBand(flight.altitudeFt);
        if (Math.abs((this.markerTracks.get(key) ?? 0) - track) > 2 || this.markerBands.get(key) !== band) {
          marker.setIcon(this.iconFor(flight));
          this.markerTracks.set(key, track);
          this.markerBands.set(key, band);
        }
      } else {
        const created = L.marker([flight.lat, flight.lon], {
          icon: this.iconFor(flight),
          keyboard: false,
        })
          .on('click', () => this.selectByKey(key))
          .addTo(this.aircraftLayer);
        this.markers.set(key, created);
        this.markerTracks.set(key, flight.track ?? 0);
        this.markerBands.set(key, this.altitudeBand(flight.altitudeFt));
      }
    }

    for (const [key, marker] of this.markers) {
      if (!seen.has(key)) {
        marker.remove();
        this.markers.delete(key);
        this.markerTracks.delete(key);
        this.markerBands.delete(key);
      }
    }
  }

  private selectByKey(key: string): void {
    const flight = this.flights.flights.find(item => (item.hex || `${item.lat},${item.lon}`) === key);
    if (flight) {
      void this.select(flight);
    }
  }

  private iconFor(flight: Flight): L.DivIcon {
    const rotation = flight.track ?? 0;
    return L.divIcon({
      className: `plane-marker plane-marker--${this.altitudeBand(flight.altitudeFt)}`,
      html: `<div class="plane" style="transform: rotate(${rotation}deg)"><svg viewBox="0 0 24 24"><path d="M12 2 19 21 12 17 5 21z"/></svg></div>`,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  }

  private altitudeBand(feet: number | null): string {
    if (feet === null || feet < 1000) {
      return 'ground';
    }
    if (feet < 10000) {
      return 'low';
    }
    if (feet < 25000) {
      return 'mid';
    }
    return 'high';
  }

  private async select(flight: Flight): Promise<void> {
    void this.modal.open(flight);
    const route = await this.routeFor(flight);
    this.drawRoute(route);
  }

  private async routeFor(flight: Flight): Promise<FlightRoute | null> {
    const callsign = flight.callsign.trim();
    if (!callsign) {
      return null;
    }

    if (!this.routeCache.has(callsign)) {
      this.routeCache.set(callsign, await this.adsb.route(callsign));
    }
    return this.routeCache.get(callsign) ?? null;
  }

  private drawRoute(route: FlightRoute | null): void {
    this.routeLayer.clearLayers();

    if (
      !route ||
      route.originLat === null ||
      route.originLon === null ||
      route.destinationLat === null ||
      route.destinationLon === null
    ) {
      return;
    }

    const origin: L.LatLngTuple = [route.originLat, route.originLon];
    const destination: L.LatLngTuple = [route.destinationLat, route.destinationLon];

    L.polyline([origin, destination], {
      color: '#1f6feb',
      weight: 2,
      opacity: 0.7,
      dashArray: '6 8',
    }).addTo(this.routeLayer);

    const airports: Array<[L.LatLngTuple, string]> = [
      [origin, route.originIata],
      [destination, route.destinationIata],
    ];

    for (const [point, code] of airports) {
      L.circleMarker(point, {
        radius: 4,
        color: '#ffffff',
        weight: 2,
        fillColor: '#1f6feb',
        fillOpacity: 1,
      })
        .bindTooltip(code, { permanent: true, direction: 'top', className: 'airport-label' })
        .addTo(this.routeLayer);
    }
  }

  private onMapMove(): void {
    if (this.moveTimer) {
      clearTimeout(this.moveTimer);
    }

    this.moveTimer = setTimeout(() => {
      if (!this.map) {
        return;
      }
      const center = this.map.getCenter();
      this.flights.setCenter(center.lat, center.lng, this.radiusFor(this.map));
      void this.refresh(true);
    }, 700);
  }

  private radiusFor(map: L.Map): number {
    const radiusKm = map.getCenter().distanceTo(map.getBounds().getNorthEast()) / 1000;
    return Math.min(250, Math.max(150, Math.ceil(radiusKm / 1.852)));
  }

  private startTimer(): void {
    this.stopTimer();
    this.timer = setInterval(() => void this.refresh(), 10000);
  }

  private stopTimer(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
