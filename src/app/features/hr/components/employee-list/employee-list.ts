import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HrService } from '../../../../core/services/hr.service';
import { Employee, Department, AttendanceLog } from '../../../../core/models/hr.model';

/**
 * COMPONENT: EmployeeListComponent (HR Overview)
 * * Purpose:
 * - Display HR & Departments module overview with key statistics
 * - Show stat cards: Total Employees, Total Departments, Present Today, Attendance Rate
 * - Provide tabbed interface to switch between Departments and Employees views
 * - Allow managing employees and departments with action buttons
 */
@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './employee-list.html',
  styleUrl: './employee-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeListComponent implements OnInit {
  // ===== DEPENDENCY INJECTION =====
  private hrService = inject(HrService);

  // ===== STATE SIGNALS =====
  employees = signal<Employee[]>([]);
  departments = signal<Department[]>([]);
  attendanceLogs = signal<AttendanceLog[]>([]); // 🆕 New Signal for Attendance

  activeTab = signal<'departments' | 'employees'>('departments');
  isLoading = signal<boolean>(true);

  // ===== COMPUTED SIGNALS =====
  totalEmployees = computed(() => this.employees().length);
  totalDepartments = computed(() => this.departments().length);

  // 🆕 Updated: Calculate present employees based on actual logs
  // Filters logs where status contains "Present"
  presentToday = computed(() => {
    return this.attendanceLogs().filter(log => log.status.includes('Present')).length;
  });

  // 🆕 Updated: Calculate attendance rate dynamically
  attendanceRate = computed(() => {
    const total = this.totalEmployees();
    if (total === 0) return 0;
    return Math.round((this.presentToday() / total) * 100);
  });

  /**
   * ANGULAR LIFECYCLE HOOK
   */
  ngOnInit() {
    this.loadData();
  }

  /**
   * LOAD DATA METHOD
   * Fetches Employees, Departments, AND Attendance Logs in parallel
   * Updates loading state only when all 3 requests complete
   */
  loadData() {
    this.isLoading.set(true);
    let loadedCount = 0;
    // We expect 3 successful responses to stop loading
    const checkLoading = () => {
      loadedCount++;
      if (loadedCount === 3) this.isLoading.set(false);
    };

    // 1. Fetch Employees
    this.hrService.getEmployees().subscribe({
      next: (data) => {
        this.employees.set(data);
        checkLoading();
      },
      error: (err) => {
        console.error('Error fetching employees:', err);
        checkLoading();
      }
    });

    // 2. Fetch Departments
    this.hrService.getDepartments().subscribe({
      next: (data) => {
        this.departments.set(data);
        checkLoading();
      },
      error: (err) => {
        console.error('Error fetching departments:', err);
        checkLoading();
      }
    });

    // 3. Fetch Today's Attendance Logs (🆕 New Request)
    this.hrService.getTodayAttendance().subscribe({
      next: (data) => {
        this.attendanceLogs.set(data);
        checkLoading();
      },
      error: (err) => {
        console.error('Error fetching attendance:', err);
        checkLoading();
      }
    });
  }

  /**
   * Helper to count employees per department
   */
  getEmployeeCountByDepartment(deptId: number): number {
    return this.employees().filter(e => e.departmentId === deptId).length;
  }

  /**
   * Tab Switcher
   */
  setActiveTab(tab: 'departments' | 'employees') {
    this.activeTab.set(tab);
  }
}