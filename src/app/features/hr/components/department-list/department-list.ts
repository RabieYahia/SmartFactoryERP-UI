import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HrService } from '../../../../core/services/hr.service';
import { Department } from '../../../../core/models/hr.model';

@Component({
  selector: 'app-department-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './department-list.html',
  styleUrl: './department-list.css',
})
export class DepartmentList implements OnInit {
  private hrService = inject(HrService);
  departments = signal<Department[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.isLoading.set(true);
    this.hrService.getDepartments().subscribe({
      next: (data) => {
        console.log('Departments loaded:', data); // للتأكد
        this.departments.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading departments:', err);
        alert('❌ Failed to load departments');
        this.isLoading.set(false);
      }
    });
  }

  onDelete(dept: Department) {
    if (!confirm(`Delete department "${dept.name}"? This cannot be undone.`)) return;
    this.isLoading.set(true);
    this.hrService.deleteDepartment(dept.id).subscribe({
      next: () => {
        alert('✅ Department deleted');
        this.loadDepartments();
      },
      error: (err) => {
        console.error('Error deleting department:', err);
        alert('❌ Failed to delete department');
        this.isLoading.set(false);
      }
    });
  }
}