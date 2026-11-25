import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompareCrops } from './compare-crops';

describe('CompareCrops', () => {
  let component: CompareCrops;
  let fixture: ComponentFixture<CompareCrops>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompareCrops]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompareCrops);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
