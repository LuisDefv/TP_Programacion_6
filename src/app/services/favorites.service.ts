import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject, Observable } from 'rxjs';

import { Flight, SavedFlight } from '../models/flight.model';

const FAVORITES_KEY = 'radar:favorites';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private readonly subject = new BehaviorSubject<SavedFlight[]>([]);
  private loaded = false;

  readonly favorites$: Observable<SavedFlight[]> = this.subject.asObservable();

  constructor() {
    void this.load();
  }

  get favorites(): SavedFlight[] {
    return this.subject.value;
  }

  isFavorite(hex: string): boolean {
    return this.subject.value.some(item => item.hex === hex);
  }

  async toggle(flight: Flight): Promise<boolean> {
    await this.ensureLoaded();
    const exists = this.isFavorite(flight.hex);
    const next = exists
      ? this.subject.value.filter(item => item.hex !== flight.hex)
      : [this.toSaved(flight), ...this.subject.value];

    await this.persist(next);
    return !exists;
  }

  async remove(hex: string): Promise<void> {
    await this.ensureLoaded();
    const next = this.subject.value.filter(item => item.hex !== hex);
    await this.persist(next);
  }

  async load(): Promise<void> {
    const { value } = await Preferences.get({ key: FAVORITES_KEY });
    let favorites: SavedFlight[] = [];

    if (value) {
      try {
        favorites = JSON.parse(value) as SavedFlight[];
      } catch {
        favorites = [];
      }
    }

    this.subject.next(favorites);
    this.loaded = true;
  }

  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      await this.load();
    }
  }

  private async persist(favorites: SavedFlight[]): Promise<void> {
    this.subject.next(favorites);
    await Preferences.set({ key: FAVORITES_KEY, value: JSON.stringify(favorites) });
  }

  private toSaved(flight: Flight): SavedFlight {
    return {
      hex: flight.hex,
      callsign: flight.callsign,
      registration: flight.registration,
      type: flight.type,
      savedAt: Date.now(),
    };
  }
}
