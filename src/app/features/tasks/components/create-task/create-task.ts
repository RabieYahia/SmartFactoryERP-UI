import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TasksService } from '../../services/tasks';
import { HrService, Employee } from '../../../../core/services/hr.service';
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-task.html',
  styleUrl: './create-task.css'
})
export class CreateTaskComponent implements OnInit {
  private fb = inject(FormBuilder);
  private tasksService = inject(TasksService);
  private hrService = inject(HrService);
  private router = inject(Router);
  private alertService = inject(AlertService);

  employees = signal<Employee[]>([]);
  isSubmitting = signal(false);

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    dueDate: ['', Validators.required],
    priority: [1, Validators.required], // 1=Low, 2=Medium, 3=High
    assignedEmployeeId: ['', Validators.required]
  });

  ngOnInit() {
    this.hrService.getEmployees().subscribe(res => this.employees.set(res));
  }

  onSubmit() {
    if (this.form.invalid) return;

    const rawDue = this.form.value.dueDate;
    const due = rawDue ? new Date(rawDue) : null;
    const now = new Date();
    if (!due || due.getTime() <= now.getTime()) {
      this.alertService.error('Due date cannot be in the past or empty. Please choose a future date.');
      return;
    }

    this.isSubmitting.set(true);

    const payload = {
      ...this.form.value,
      priority: Number(this.form.value.priority),
      assignedEmployeeId: Number(this.form.value.assignedEmployeeId),
      dueDate: due.toISOString()
    };

    this.tasksService.createTask(payload).subscribe({
      next: () => {
        this.alertService.success('Task Assigned Successfully!');
        this.router.navigate(['/tasks']);
      },
      error: (err) => {
        console.error('Create Task Error:', err);
        // Log server response body if available to help debugging
        if (err && err.error) console.error('Server error body:', err.error);
        const serverMsg = err?.error?.message || err?.message || 'Error creating task';
        this.alertService.error(serverMsg);
        this.isSubmitting.set(false);
      }
    });
  }
}