import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictionCharts } from './prediction-charts';

describe('PredictionCharts', () => {
  let component: PredictionCharts;
  let fixture: ComponentFixture<PredictionCharts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredictionCharts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PredictionCharts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

