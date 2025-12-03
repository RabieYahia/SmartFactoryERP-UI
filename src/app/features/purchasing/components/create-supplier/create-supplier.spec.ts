import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateSupplier } from './create-supplier';

describe('CreateSupplier', () => {
  let component: CreateSupplier;
  let fixture: ComponentFixture<CreateSupplier>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateSupplier]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateSupplier);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
