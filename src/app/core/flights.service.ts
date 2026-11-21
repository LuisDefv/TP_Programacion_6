import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable } from 'rxjs';

import { AdsbService } from './adsb.service';
import { Flight } from './flight.model';

export interface FlightsStatus {
  loading: boolean;
  updatedAt: number | null;
  error: string | null;
  cached: boolean;
}

interface FlightCache {
  at: number;
  flights: Flight[];
}

const CACHE_KEY = 'radar:last-flights';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class FlightsService {
  private readonly flightsSubject = new BehaviorSubject<Flight[]>([]);
  private readonly statusSubject = new BehaviorSubject<FlightsStatus>({
    loading: false,
    updatedAt: null,
    error: null,
    cached: false,
  });

  private center = { lat: -25.2865, lon: -57.647 };
  private radiusNm = 250;
  private running = false;
  private nextRetryAt = 0;

  readonly flights$: Observable<Flight[]> = this.flightsSubject.asObservable();
  readonly status$: Observable<FlightsStatus> = this.statusSubject.asObservable();

  constructor(private readonly adsb: AdsbService) {}

  get currentCenter(): { lat: number; lon: number } {
    return this.center;
  }

  get flights(): Flight[] {
    return this.flightsSubject.value;
  }

  setCenter(lat: number, lon: number, radiusNm?: number): void {
    this.center = { lat, lon };
    if (radiusNm) {
      this.radiusNm = radiusNm;
    }
  }

  async refresh(force = false): Promise<void> {
    if (this.running) {
      return;
    }

    if (!force && Date.now() < this.nextRetryAt) {
      return;
    }

    this.running = true;
    this.patchStatus({ loading: true });

    try {
      const flights = await this.fetch();
      this.nextRetryAt = 0;
      this.flightsSubject.next(flights);
      this.patchStatus({ loading: false, updatedAt: Date.now(), cached: false, error: null });
      await this.saveCache(flights);
    } catch {
      this.nextRetryAt = Date.now() + 30000;
      const cached = await this.loadCache();
      if (this.flightsSubject.value.length === 0 && cached.length > 0) {
        this.flightsSubject.next(cached);
      }
      this.patchStatus({
        loading: false,
        cached: cached.length > 0,
        error: 'Sin conexión con el radar.',
      });
    } finally {
      this.running = false;
    }
  }

  private async fetch(): Promise<Flight[]> {
    return this.adsb.nearby(this.center.lat, this.center.lon, this.radiusNm);
  }

  async restoreCache(): Promise<void> {
    if (this.flightsSubject.value.length > 0) {
      return;
    }

    const cached = await this.loadCache();
    if (cached.length > 0) {
      this.flightsSubject.next(cached);
      this.patchStatus({ cached: true });
    }
  }

  private patchStatus(partial: Partial<FlightsStatus>): void {
    this.statusSubject.next({ ...this.statusSubject.value, ...partial });
  }

  private async saveCache(flights: Flight[]): Promise<void> {
    const payload: FlightCache = { at: Date.now(), flights };
    await Preferences.set({ key: CACHE_KEY, value: JSON.stringify(payload) });
  }

  private async loadCache(): Promise<Flight[]> {
    const { value } = await Preferences.get({ key: CACHE_KEY });
    if (!value) {
      return [];
    }

    try {
      const payload = JSON.parse(value) as FlightCache;
      if (Date.now() - payload.at > CACHE_TTL_MS) {
        return [];
      }
      return payload.flights ?? [];
    } catch {
      return [];
    }
  }
}
