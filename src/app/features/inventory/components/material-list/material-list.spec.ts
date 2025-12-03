import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialListComponent } from './material-list'; // 1. تأكد من اسم الملف
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing'; // عشان نمثل الاتصال بالسيرفر
import { provideRouter } from '@angular/router'; // عشان routerLink يشتغل

describe('MaterialListComponent', () => {
  let component: MaterialListComponent; // 2. استخدام الاسم الصحيح للكلاس
  let fixture: ComponentFixture<MaterialListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialListComponent], // الكومبوننت Standalone، فبيتحط في imports
      providers: [
        // 3. توفير التبعيات اللازمة عشان الكومبوننت يقوم
        provideHttpClient(), 
        provideHttpClientTesting(), 
        provideRouter([]) 
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaterialListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});