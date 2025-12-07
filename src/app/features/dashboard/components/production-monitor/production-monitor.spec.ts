import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductionMonitor } from './production-monitor';

describe('ProductionMonitor', () => {
  let component: ProductionMonitor;
  let fixture: ComponentFixture<ProductionMonitor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductionMonitor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductionMonitor);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
