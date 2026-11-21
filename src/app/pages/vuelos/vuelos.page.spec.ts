import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { Flight } from '../../models/flight.model';
import { FlightModalService } from '../../services/flight-modal.service';
import { FlightsService, FlightsStatus } from '../../services/flights.service';
import { makeFlight } from '../../testing/flight.fixture';
import { VuelosPageModule } from './vuelos.module';
import { VuelosPage } from './vuelos.page';

describe('VuelosPage', () => {
  let component: VuelosPage;
  let fixture: ComponentFixture<VuelosPage>;
  const flights$ = new BehaviorSubject<Flight[]>([]);
  const status$ = new BehaviorSubject<FlightsStatus>({
    loading: false,
    updatedAt: null,
    error: null,
    cached: false,
  });
  const flightsService = {
    flights$,
    status$,
    restoreCache: vi.fn().mockResolvedValue(undefined),
    refresh: vi.fn().mockResolvedValue(undefined),
  };
  const modal = { open: vi.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    flights$.next([
      makeFlight({ hex: 'aaa111', callsign: 'LAP700', registration: 'ZP-CTI' }),
      makeFlight({ hex: 'bbb222', callsign: 'AZU4560', registration: 'PR-AXB' }),
    ]);

    await TestBed.configureTestingModule({
      imports: [VuelosPageModule, RouterModule.forRoot([])],
      providers: [
        { provide: FlightsService, useValue: flightsService },
        { provide: FlightModalService, useValue: modal },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VuelosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function search(value: string): Flight[] {
    let result: Flight[] = [];
    const sub = component.filtered$.subscribe(list => (result = list));
    component.onSearch(new CustomEvent('ionInput', { detail: { value } }));
    sub.unsubscribe();
    return result;
  }

  it('se crea y carga los vuelos en ngOnInit', () => {
    expect(component).toBeTruthy();
    expect(flightsService.restoreCache).toHaveBeenCalled();
  });

  it('filtra por callsign sin distinguir mayusculas', () => {
    expect(search('lap').map(f => f.hex)).toEqual(['aaa111']);
  });

  it('filtra por matricula y por hex', () => {
    expect(search('pr-axb').map(f => f.hex)).toEqual(['bbb222']);
    expect(search('AAA1').map(f => f.hex)).toEqual(['aaa111']);
  });

  it('sin texto muestra todos los vuelos', () => {
    expect(search('   ').length).toBe(2);
  });

  it('al tocar un vuelo abre el detalle', () => {
    const flight = flights$.value[0];
    component.open(flight);
    expect(modal.open).toHaveBeenCalledWith(flight);
  });
});
