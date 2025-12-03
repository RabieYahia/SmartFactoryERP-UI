import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateReceipt } from './create-receipt';

describe('CreateReceipt', () => {
  let component: CreateReceipt;
  let fixture: ComponentFixture<CreateReceipt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateReceipt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateReceipt);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
