import { Flight } from '../models/flight.model';

export function makeFlight(partial: Partial<Flight> = {}): Flight {
  return {
    hex: 'e8044e',
    callsign: 'LAP700',
    registration: 'ZP-CTI',
    type: 'A320',
    lat: -25.3,
    lon: -57.6,
    altitudeFt: 35000,
    speedKt: 450,
    track: 90,
    verticalRate: 0,
    distanceKm: 12.4,
    ...partial,
  };
}
