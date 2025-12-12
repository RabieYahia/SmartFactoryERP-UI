import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { HrService } from '../../../../core/services/hr.service';

@Component({
  selector: 'app-create-department',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-department.html',
  styleUrl: './create-department.css' // أو scss
})
export class CreateDepartmentComponent implements OnInit {
  private fb = inject(FormBuilder);
  private hrService = inject(HrService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isSubmitting = signal(false);
  isEdit = signal(false);
  editingId: number | null = null;

  form = this.fb.group({
    name: ['', Validators.required],
    code: ['', Validators.required],
    description: ['']
  });

  onSubmit() {
    if (this.form.invalid) {
      alert('⚠️ Please fill in all required fields');
      return;
    }
    
    this.isSubmitting.set(true);

    const payload = this.form.value;

    if (this.isEdit()) {
      // update
      this.hrService.updateDepartment(this.editingId as number, payload).subscribe({
        next: () => {
          alert('✅ Department updated!');
          this.isSubmitting.set(false);
          this.router.navigate(['/hr']);
        },
        error: (err) => this.handleError(err)
      });
      return;
    }

    this.hrService.createDepartment(payload).subscribe({
      next: () => {
        alert('✅ Department Created!');
        this.isSubmitting.set(false);
        this.router.navigate(['/hr']); // Navigate to HR module
      },
      error: (err) => {
        this.handleError(err);
      }
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.isEdit.set(true);
      this.editingId = id;
      // Workaround: Load all departments and filter (backend missing GET /departments/{id})
      this.hrService.getDepartments().subscribe({
        next: (departments) => {
          const dept = departments.find(d => d.id === id);
          if (dept) {
            this.form.patchValue({
              name: dept.name,
              code: dept.code,
              description: dept.description
            });
          } else {
            alert('❌ Department not found');
          }
        },
        error: (err) => {
          console.error('Error loading department for edit:', err);
          alert('❌ Failed to load department');
        }
      });
    }
  }

  private handleError(err: any) {
    console.error(err);
    const errorMsg = err.error?.message || err.message || 'Operation failed';
    alert(`❌ ${errorMsg}`);
    this.isSubmitting.set(false);
  }
}