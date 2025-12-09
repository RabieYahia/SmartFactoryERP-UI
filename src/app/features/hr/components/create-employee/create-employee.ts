import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HrService } from '../../../../core/services/hr.service';
import { Department } from '../../../../core/models/hr.model';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-create-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-employee.html',
  styleUrl: './create-employee.css'
})
export class CreateEmployeeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private hrService = inject(HrService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  departments = signal<Department[]>([]); // 👈 عشان الـ Dropdown
  isSubmitting = signal(false);

  form = this.fb.group({
    fullName: ['', Validators.required],
    jobTitle: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', Validators.required],
    departmentId: ['', Validators.required] // ربط الموظف بالقسم
  });

  ngOnInit() {
    // تحميل الأقسام
    this.hrService.getDepartments().subscribe(res => this.departments.set(res));
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);

    // تحويل ID القسم لرقم
    const payload = {
      ...this.form.value,
      departmentId: Number(this.form.value.departmentId)
    };

    this.hrService.createEmployee(payload).subscribe({
      next: () => {
        this.alertService.success('Employee Created!');
        this.router.navigate(['/hr/employees']);
      },
      error: (err) => {
        console.error(err);
        this.alertService.error('Error creating employee');
        this.isSubmitting.set(false);
      }
    });
  }
}