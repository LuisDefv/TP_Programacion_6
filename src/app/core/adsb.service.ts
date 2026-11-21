import { Injectable } from '@angular/core';
import { Capacitor, CapacitorHttp } from '@capacitor/core';

import { AircraftInfo, Flight, FlightRoute } from './flight.model';
import { distanceKm } from './geo';

interface RawAircraft {
  hex?: string;
  flight?: string;
  r?: string;
  t?: string;
  lat?: number;
  lon?: number;
  alt_baro?: number | string;
  gs?: number;
  track?: number;
  baro_rate?: number;
}

interface PointResponse {
  ac?: RawAircraft[];
}

@Injectable({ providedIn: 'root' })
export class AdsbService {
  private readonly isWeb = Capacitor.getPlatform() === 'web';
  private readonly liveBase = this.isWeb ? '/adsbfi/api/v3' : 'https://opendata.adsb.fi/api/v3';
  private readonly fallbackBase = this.isWeb ? '/adsb/v2' : 'https://api.adsb.lol/v2';
  private readonly infoUrl = this.isWeb ? '/adsbdb/v0' : 'https://api.adsbdb.com/v0';
  private readonly routes = new Map<string, Promise<FlightRoute | null>>();

  async nearby(lat: number, lon: number, radiusNm = 250): Promise<Flight[]> {
    const position = `${lat.toFixed(3)}`;
    const longitude = `${lon.toFixed(3)}`;
    const data = await this.getFirst<PointResponse>([
      `${this.liveBase}/lat/${position}/lon/${longitude}/dist/${radiusNm}`,
      `${this.fallbackBase}/point/${position}/${longitude}/${radiusNm}`,
    ]);
    const aircraft = data.ac ?? [];
    const center = { lat, lon };

    return aircraft
      .filter(item => typeof item.lat === 'number' && typeof item.lon === 'number')
      .map(item => this.toFlight(item, center))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  route(callsign: string): Promise<FlightRoute | null> {
    const key = callsign.trim().toUpperCase();
    if (!key) {
      return Promise.resolve(null);
    }

    let pending = this.routes.get(key);
    if (!pending) {
      pending = this.fetchRoute(key);
      this.routes.set(key, pending);
    }
    return pending;
  }

  private async fetchRoute(callsign: string): Promise<FlightRoute | null> {
    try {
      const data = await this.getJson<{
        response?: {
          flightroute?: {
            airline?: { name?: string };
            origin?: {
              iata_code?: string;
              municipality?: string;
              latitude?: number;
              longitude?: number;
            };
            destination?: {
              iata_code?: string;
              municipality?: string;
              latitude?: number;
              longitude?: number;
            };
          };
        };
      }>(`${this.infoUrl}/callsign/${encodeURIComponent(callsign)}`);

      const route = data.response?.flightroute;
      if (!route) {
        return null;
      }

      return {
        airline: route.airline?.name ?? '',
        originIata: route.origin?.iata_code ?? '',
        originCity: route.origin?.municipality ?? '',
        destinationIata: route.destination?.iata_code ?? '',
        destinationCity: route.destination?.municipality ?? '',
        originLat: route.origin?.latitude ?? null,
        originLon: route.origin?.longitude ?? null,
        destinationLat: route.destination?.latitude ?? null,
        destinationLon: route.destination?.longitude ?? null,
      };
    } catch {
      return null;
    }
  }

  async aircraft(hex: string): Promise<AircraftInfo | null> {
    try {
      const data = await this.getJson<{
        response?: {
          aircraft?: {
            manufacturer?: string;
            type?: string;
            registration?: string;
            registered_owner?: string;
          };
        };
      }>(`${this.infoUrl}/aircraft/${hex}`);

      const info = data.response?.aircraft;
      if (!info) {
        return null;
      }

      return {
        manufacturer: info.manufacturer ?? '',
        model: info.type ?? '',
        registration: info.registration ?? '',
        owner: info.registered_owner ?? '',
      };
    } catch {
      return null;
    }
  }

  private async getFirst<T>(urls: string[]): Promise<T> {
    let lastError: unknown;

    for (const url of urls) {
      try {
        return await this.getJson<T>(url);
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
  }

  private async getJson<T>(url: string): Promise<T> {
    const response = await CapacitorHttp.get({ url, connectTimeout: 6000, readTimeout: 8000 });
    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    return data as T;
  }

  private toFlight(item: RawAircraft, center: { lat: number; lon: number }): Flight {
    const lat = item.lat as number;
    const lon = item.lon as number;
    const altitude = typeof item.alt_baro === 'number' ? item.alt_baro : null;

    return {
      hex: item.hex ?? '',
      callsign: (item.flight ?? '').trim(),
      registration: item.r ?? '',
      type: item.t ?? '',
      lat,
      lon,
      altitudeFt: altitude,
      speedKt: item.gs ?? null,
      track: item.track ?? null,
      verticalRate: item.baro_rate ?? null,
      distanceKm: distanceKm(center, { lat, lon }),
    };
  }
}
