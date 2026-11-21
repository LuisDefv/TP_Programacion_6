const EARTH_RADIUS_KM = 6371;

export interface LatLon {
  lat: number;
  lon: number;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function distanceKm(from: LatLon, to: LatLon): number {
  const dLat = toRadians(to.lat - from.lat);
  const dLon = toRadians(to.lon - from.lon);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number): string {
  if (km < 0) {
    return '—';
  }
  if (km < 10) {
    return `${km.toFixed(1)} km`;
  }
  return `${Math.round(km)} km`;
}

export function formatAltitude(feet: number | null): string {
  if (feet === null) {
    return '—';
  }
  return `${Math.round(feet).toLocaleString('es-PY')} ft`;
}

export function formatSpeed(knots: number | null): string {
  if (knots === null) {
    return '—';
  }
  return `${Math.round(knots)} kt`;
}

export function formatTrack(degrees: number | null): string {
  if (degrees === null) {
    return '—';
  }
  return `${Math.round(degrees)}°`;
}

export function formatVerticalRate(feetPerMinute: number | null): string {
  if (feetPerMinute === null || feetPerMinute === 0) {
    return 'nivelado';
  }
  const sign = feetPerMinute > 0 ? '+' : '';
  return `${sign}${Math.round(feetPerMinute).toLocaleString('es-PY')} ft/min`;
}
