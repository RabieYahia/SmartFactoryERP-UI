import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMaterial } from './create-material';

describe('CreateMaterial', () => {
  let component: CreateMaterial;
  let fixture: ComponentFixture<CreateMaterial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMaterial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateMaterial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
