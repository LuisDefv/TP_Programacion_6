import {
  distanceKm,
  formatAltitude,
  formatDistance,
  formatSpeed,
  formatTrack,
  formatVerticalRate,
} from './geo';

describe('geo', () => {
  it('calcula la distancia entre Asuncion y Buenos Aires (~1040 km)', () => {
    const asuncion = { lat: -25.2865, lon: -57.647 };
    const buenosAires = { lat: -34.6037, lon: -58.3816 };
    expect(distanceKm(asuncion, buenosAires)).toBeGreaterThan(1020);
    expect(distanceKm(asuncion, buenosAires)).toBeLessThan(1060);
  });

  it('la distancia a uno mismo es 0', () => {
    expect(distanceKm({ lat: 1, lon: 2 }, { lat: 1, lon: 2 })).toBe(0);
  });

  it('formatea la distancia con un decimal solo si es menor a 10 km', () => {
    expect(formatDistance(3.456)).toBe('3.5 km');
    expect(formatDistance(123.6)).toBe('124 km');
    expect(formatDistance(-1)).toBe('—');
  });

  it('formatea altitud, velocidad y rumbo, con guion si no hay dato', () => {
    expect(formatAltitude(null)).toBe('—');
    expect(formatAltitude(800)).toBe('800 ft');
    expect(formatSpeed(451.7)).toBe('452 kt');
    expect(formatSpeed(null)).toBe('—');
    expect(formatTrack(89.6)).toBe('90°');
    expect(formatTrack(null)).toBe('—');
  });

  it('formatea el regimen vertical con signo', () => {
    expect(formatVerticalRate(0)).toBe('nivelado');
    expect(formatVerticalRate(null)).toBe('nivelado');
    expect(formatVerticalRate(640)).toBe('+640 ft/min');
    expect(formatVerticalRate(-320)).toBe('-320 ft/min');
  });
});
