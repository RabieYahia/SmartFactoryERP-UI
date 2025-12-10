import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TasksService, Task } from '../../services/tasks';
import { AlertService } from '../../../../core/services/alert.service';
import { ConfirmService } from '../../../../core/services/confirm.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css'
})
export class TaskListComponent implements OnInit {
  private tasksService = inject(TasksService);
  private alertService = inject(AlertService);
  private confirmService = inject(ConfirmService);

  tasks = signal<Task[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.tasksService.getTasks().subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
      }
    });
  }

  // دالة لتغيير الحالة (Start أو Complete)
  updateStatus(task: Task, newStatus: 'Start' | 'Complete') {
    const actionWord = newStatus === 'Start' ? 'Start working on' : 'Complete';
    
    this.confirmService.warning(
      `Are you sure you want to ${actionWord} this task?`,
      () => this.proceedUpdateStatus(task, newStatus)
    );
  }

  private proceedUpdateStatus(task: Task, newStatus: 'Start' | 'Complete') {
    // تحديث واجهة المستخدم فوراً (Optimistic Update) أو إظهار تحميل
    // هنا سنعيد التحميل لضمان البيانات
    this.isLoading.set(true);

    this.tasksService.changeTaskStatus(task.id, newStatus).subscribe({
      next: () => {
        // رسالة نجاح وإعادة تحميل
        this.alertService.success(`Task ${newStatus === 'Start' ? 'Started' : 'Completed'}!`);
        this.loadTasks();
      },
      error: (err) => {
        console.error(err);
        this.alertService.error('Error updating status');
        this.isLoading.set(false);
      }
    });
  }

  // دالة مساعدة لتنسيق الألوان حسب الأولوية
  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      default: return 'priority-low';
    }
  }
}