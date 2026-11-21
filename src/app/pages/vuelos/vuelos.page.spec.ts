import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';

import { VuelosPageModule } from './vuelos.module';
import { VuelosPage } from './vuelos.page';

describe('VuelosPage', () => {
  let component: VuelosPage;
  let fixture: ComponentFixture<VuelosPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VuelosPageModule, RouterModule.forRoot([])]
    }).compileComponents();

    fixture = TestBed.createComponent(VuelosPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
