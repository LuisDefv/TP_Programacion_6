import { TestBed } from '@angular/core/testing';

import { makeFlight } from '../testing/flight.fixture';
import { AdsbService } from './adsb.service';
import { FlightsService } from './flights.service';

describe('FlightsService', () => {
  const adsb = { nearby: vi.fn() };

  function create(): FlightsService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: AdsbService, useValue: adsb }] });
    return TestBed.inject(FlightsService);
  }

  beforeEach(() => {
    localStorage.clear();
    adsb.nearby.mockReset();
  });

  it('publica los vuelos que devuelve la API', async () => {
    adsb.nearby.mockResolvedValue([makeFlight()]);
    const service = create();

    await service.refresh(true);

    expect(service.flights.length).toBe(1);
  });

  it('si la API falla muestra el ultimo listado guardado y un aviso', async () => {
    adsb.nearby.mockResolvedValue([makeFlight({ hex: 'abc123' })]);
    await create().refresh(true);

    adsb.nearby.mockRejectedValue(new Error('offline'));
    const offline = create();
    let status = { error: null as string | null, cached: false };
    offline.status$.subscribe(value => (status = value));

    await offline.refresh(true);

    expect(offline.flights.map(f => f.hex)).toEqual(['abc123']);
    expect(status.error).toBeTruthy();
    expect(status.cached).toBe(true);
  });
});
