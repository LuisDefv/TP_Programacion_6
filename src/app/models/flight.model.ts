export interface Flight {
  hex: string;
  callsign: string;
  registration: string;
  type: string;
  lat: number;
  lon: number;
  altitudeFt: number | null;
  speedKt: number | null;
  track: number | null;
  verticalRate: number | null;
  distanceKm: number;
}

export interface FlightRoute {
  airline: string;
  originIata: string;
  originCity: string;
  destinationIata: string;
  destinationCity: string;
  originLat: number | null;
  originLon: number | null;
  destinationLat: number | null;
  destinationLon: number | null;
}

export interface AircraftInfo {
  manufacturer: string;
  model: string;
  registration: string;
  owner: string;
}

export interface SavedFlight {
  hex: string;
  callsign: string;
  registration: string;
  type: string;
  savedAt: number;
}
