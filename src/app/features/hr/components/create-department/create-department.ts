import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HrService } from '../../../../core/services/hr.service';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-create-department',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-department.html',
  styleUrl: './create-department.css' // أو scss
})
export class CreateDepartmentComponent {
  private fb = inject(FormBuilder);
  private hrService = inject(HrService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  isSubmitting = signal(false);

  form = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    description: ['']
  });

  onSubmit() {
    if (this.form.invalid) return;
    this.isSubmitting.set(true);

    this.hrService.createDepartment(this.form.value).subscribe({
      next: () => {
        this.alertService.success('Department Created!');
        this.router.navigate(['/hr/employees']); // أو أي مكان تحبه
      },
      error: (err) => {
        this.alertService.error('Error creating department');
        this.isSubmitting.set(false);
      }
    });
  }
}