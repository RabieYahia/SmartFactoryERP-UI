import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMaterial } from './edit-material';

describe('EditMaterial', () => {
  let component: EditMaterial;
  let fixture: ComponentFixture<EditMaterial>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMaterial]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditMaterial);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
