import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastResult } from './forecast-result';

describe('ForecastResult', () => {
  let component: ForecastResult;
  let fixture: ComponentFixture<ForecastResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForecastResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForecastResult);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
