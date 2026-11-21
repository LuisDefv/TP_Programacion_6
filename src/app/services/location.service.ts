import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';

import { LatLon } from '../utils/geo';

export const DEFAULT_CENTER: LatLon = { lat: -25.2865, lon: -57.647 };

@Injectable({ providedIn: 'root' })
export class LocationService {
  async current(): Promise<LatLon> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: false,
        timeout: 8000,
      });
      return {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
      };
    } catch {
      return DEFAULT_CENTER;
    }
  }
}
