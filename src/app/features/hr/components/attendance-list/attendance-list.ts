import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // عشان نستخدم ngModel في الـ Select
import { HrService } from '../../../../core/services/hr.service';
import { Employee, AttendanceLog } from '../../../../core/models/hr.model'; // تأكد من المسار
import { AlertService } from '../../../../core/services/alert.service';

@Component({
  selector: 'app-attendance-list',
  standalone: true,
  imports: [CommonModule, FormsModule], // 👈 مهم جداً للـ Two-way binding
  templateUrl: './attendance-list.html',
  styleUrl: './attendance-list.css'
})
export class AttendanceListComponent implements OnInit {
  private hrService = inject(HrService);
  private alertService = inject(AlertService);

  // Data Signals
  employees = signal<Employee[]>([]);       // القائمة المنسدلة
  attendanceLogs = signal<AttendanceLog[]>([]); // جدول اليوم
  
  // Selection
  selectedEmployeeId: number | null = null;
  isLoading = signal<boolean>(false);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // تحميل الموظفين
    this.hrService.getEmployees().subscribe(res => this.employees.set(res));
    // تحميل سجل اليوم
    this.loadTodayLogs();
  }

  loadTodayLogs() {
    this.hrService.getTodayAttendance().subscribe(res => this.attendanceLogs.set(res));
  }

  onToggle() {
    if (!this.selectedEmployeeId) {
      this.alertService.warning('Please select an employee first!');
      return;
    }

    this.isLoading.set(true);

    this.hrService.toggleAttendance(this.selectedEmployeeId).subscribe({
      next: (res) => {
        this.alertService.success(res.message); // رسالة الـ Backend (Checked In / Out)
        this.loadTodayLogs(); // تحديث الجدول فوراً
        this.isLoading.set(false);
        this.selectedEmployeeId = null; // تصفير الاختيار
      },
      error: (err) => {
        console.error(err);
        this.alertService.error('Error updating attendance');
        this.isLoading.set(false);
      }
    });
  }
}