import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { SavedFlight } from '../../models/flight.model';
import { FavoritesService } from '../../services/favorites.service';
import { FlightModalService } from '../../services/flight-modal.service';
import { FavoritosPageModule } from './favoritos.module';
import { FavoritosPage } from './favoritos.page';

describe('FavoritosPage', () => {
  let component: FavoritosPage;
  let fixture: ComponentFixture<FavoritosPage>;
  const saved: SavedFlight = {
    hex: 'e8044e',
    callsign: 'LAP700',
    registration: 'ZP-CTI',
    type: 'A320',
    savedAt: 0,
  };
  const favorites = {
    favorites$: new BehaviorSubject<SavedFlight[]>([saved]),
    load: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined),
  };
  const modal = { open: vi.fn().mockResolvedValue(undefined) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FavoritosPageModule, RouterModule.forRoot([])],
      providers: [
        { provide: FavoritesService, useValue: favorites },
        { provide: FlightModalService, useValue: modal },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FavoritosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('se crea y carga los favoritos en ngOnInit', () => {
    expect(component).toBeTruthy();
    expect(favorites.load).toHaveBeenCalled();
  });

  it('muestra los favoritos guardados', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('LAP700');
  });

  it('elimina un favorito por hex', () => {
    component.remove('e8044e');
    expect(favorites.remove).toHaveBeenCalledWith('e8044e');
  });

  it('abre el detalle del favorito', () => {
    component.open(saved);
    expect(modal.open).toHaveBeenCalledWith(expect.objectContaining({ hex: 'e8044e' }));
  });
});
