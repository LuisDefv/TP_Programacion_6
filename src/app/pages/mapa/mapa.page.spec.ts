import { TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { FlightModalService } from '../../services/flight-modal.service';
import { FlightsService } from '../../services/flights.service';
import { MapaPageModule } from './mapa.module';
import { MapaPage } from './mapa.page';

describe('MapaPage', () => {
  const flightsService = {
    flights$: new BehaviorSubject([]),
    status$: new BehaviorSubject({ loading: false, updatedAt: null, error: null, cached: false }),
    flights: [],
    restoreCache: vi.fn().mockResolvedValue(undefined),
    refresh: vi.fn().mockResolvedValue(undefined),
    setCenter: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaPageModule, RouterModule.forRoot([])],
      providers: [
        { provide: FlightsService, useValue: flightsService },
        { provide: FlightModalService, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();
  });

  // No se llama a detectChanges: el mapa de Leaflet necesita un navegador real.
  it('se crea y restaura el ultimo listado en ngOnInit', () => {
    const component = TestBed.createComponent(MapaPage).componentInstance;
    component.ngOnInit();
    expect(component).toBeTruthy();
    expect(flightsService.restoreCache).toHaveBeenCalled();
  });
});
