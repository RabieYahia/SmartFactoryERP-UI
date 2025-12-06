import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HrService } from '../../../../core/services/hr.service';
import { Employee } from '../../../../core/models/hr.model';
import { Department } from '../../../../core/models/hr.model';

/**
 * COMPONENT: EmployeeListComponent (HR Overview)
 * 
 * Purpose:
 * - Display HR & Departments module overview with key statistics
 * - Show stat cards: Total Employees, Total Departments, Present Today, Attendance Rate
 * - Provide tabbed interface to switch between Departments and Employees views
 * - Allow managing employees and departments with action buttons
 * 
 * Features:
 * - Real-time stat cards showing HR metrics
 * - Tabbed interface (Departments tab / Employees tab)
 * - Responsive Bootstrap design
 * - Loading indicators for async data
 * - Action buttons for creating new records
 * 
 * Signals:
 * - employees: All employees in the system
 * - departments: All departments in the system
 * - activeTab: Current tab selection (departments or employees)
 * - isLoading: Loading indicator for data fetching
 * 
 * Computed:
 * - totalEmployees: Count of all employees
 * - totalDepartments: Count of all departments
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
  // All employees in the system
  employees = signal<Employee[]>([]);
  
  // All departments in the system
  departments = signal<Department[]>([]);
  
  // Current active tab: 'departments' or 'employees'
  activeTab = signal<'departments' | 'employees'>('departments');
  
  // Loading indicator while fetching data
  isLoading = signal<boolean>(true);

  // ===== COMPUTED SIGNALS =====
  // Total count of all employees
  totalEmployees = computed(() => this.employees().length);
  
  // Total count of all departments
  totalDepartments = computed(() => this.departments().length);
  
  // Count of employees present today (placeholder - can be updated with backend)
  presentToday = computed(() => Math.floor(this.totalEmployees() * 0.93)); // Example: 93% attendance
  
  // Attendance rate percentage
  attendanceRate = computed(() => {
    const total = this.totalEmployees();
    if (total === 0) return 0;
    return Math.round((this.presentToday() / total) * 100);
  });

  /**
   * GET EMPLOYEES COUNT BY DEPARTMENT
   * Returns the number of employees in a specific department
   * 
   * @param departmentId - Department ID to count employees for
   * @returns Number of employees in that department
   */
  getEmployeeCountByDepartment(departmentId: number): number {
    return this.employees().filter(e => e.departmentId === departmentId).length;
  }

  /**
   * ANGULAR LIFECYCLE HOOK
   * Called on component initialization
   * Fetches both employees and departments data
   */
  ngOnInit() {
    this.loadData();
  }

  /**
   * LOAD DATA METHOD
   * Fetches employees and departments from backend
   * Sets loading flag during fetch
   */
  loadData() {
    this.isLoading.set(true);
    
    // Fetch both employees and departments in parallel
    Promise.all([
      this.hrService.getEmployees().toPromise(),
      this.hrService.getDepartments().toPromise()
    ]).then(([emps, depts]) => {
      this.employees.set(emps || []);
      this.departments.set(depts || []);
      this.isLoading.set(false);
    }).catch((err) => {
      console.error(err);
      this.isLoading.set(false);
    });
  }

  /**
   * TAB SWITCH METHOD
   * Changes the active tab display
   * 
   * @param tab - Tab to switch to ('departments' or 'employees')
   */
  setActiveTab(tab: 'departments' | 'employees') {
    this.activeTab.set(tab);
  }
}