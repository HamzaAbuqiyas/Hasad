import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { PredictionService } from './prediction.service';

describe('PredictionService', () => {
  it('should be created', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    expect(TestBed.inject(PredictionService)).toBeTruthy();
  });
});
