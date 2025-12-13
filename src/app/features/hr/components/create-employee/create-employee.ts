import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HrService } from '../../../../core/services/hr.service';
import { Department } from '../../../../core/models/hr.model';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-create-employee',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-employee.html',
  styleUrl: './create-employee.css'
})
export class CreateEmployeeComponent implements OnInit {
  private fb = inject(FormBuilder);
  private hrService = inject(HrService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private alertService = inject(AlertService);

  departments = signal<Department[]>([]);
  isSubmitting = signal(false);
  isEdit = signal(false);
  editingId: number | null = null;

  form = this.fb.group({
    fullName: ['', Validators.required],
    jobTitle: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', Validators.required],
    departmentId: [null as number | null, Validators.required] // ✅ عدّلته لـ number
  });

  ngOnInit() {
    this.hrService.getDepartments().subscribe({
      next: (res) => this.departments.set(res),
      error: (err) => {
        console.error('Error loading departments:', err);
        alert('❌ Failed to load departments');
      }
    });

    const idParam = this.activatedRoute.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.isEdit.set(true);
      this.editingId = id;
      // Workaround: Load all employees and filter (backend missing GET /employees/{id})
      this.hrService.getEmployees().subscribe({
        next: (employees) => {
          const emp = employees.find(e => e.id === id);
          if (emp) {
            this.form.patchValue({
              fullName: emp.fullName,
              jobTitle: emp.jobTitle,
              email: emp.email,
              phoneNumber: emp.phoneNumber,
              departmentId: emp.departmentId
            });
          } else {
            alert('❌ Employee not found');
          }
        },
        error: (err) => {
          console.error('Error loading employee for edit:', err);
          alert('❌ Failed to load employee');
        }
      });
    }
  }

  onSubmit() {
    if (this.form.invalid) {
      alert('⚠️ Please fill in all required fields');
      return;
    }
    
    this.isSubmitting.set(true);

    const payload = this.form.value; // ✅ مباشرةً بدون conversion

    if (this.isEdit()) {
      this.hrService.updateEmployee(this.editingId as number, payload).subscribe({
        next: () => {
          alert('✅ Employee updated!');
          this.isSubmitting.set(false);
          this.router.navigate(['/hr']);
        },
        error: (err) => {
          console.error('Error updating employee:', err);
          const errorMsg = err.error?.message || err.message || 'Failed to update employee';
          alert(`❌ ${errorMsg}`);
          this.isSubmitting.set(false);
        }
      });
      return;
    }

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