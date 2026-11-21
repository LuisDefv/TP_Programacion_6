import { makeFlight } from '../testing/flight.fixture';
import { FavoritesService } from './favorites.service';

describe('FavoritesService', () => {
  beforeEach(() => localStorage.clear());

  it('agrega y quita un favorito con toggle', async () => {
    const service = new FavoritesService();
    const flight = makeFlight();

    expect(await service.toggle(flight)).toBe(true);
    expect(service.isFavorite(flight.hex)).toBe(true);

    expect(await service.toggle(flight)).toBe(false);
    expect(service.isFavorite(flight.hex)).toBe(false);
  });

  it('el favorito sobrevive a reabrir la app', async () => {
    await new FavoritesService().toggle(makeFlight({ hex: 'abc123' }));

    const reopened = new FavoritesService();
    await reopened.load();

    expect(reopened.favorites.map(f => f.hex)).toEqual(['abc123']);
  });

  it('elimina un favorito por hex', async () => {
    const service = new FavoritesService();
    await service.toggle(makeFlight({ hex: 'aaa111' }));
    await service.toggle(makeFlight({ hex: 'bbb222' }));

    await service.remove('aaa111');

    expect(service.favorites.map(f => f.hex)).toEqual(['bbb222']);
  });
});
