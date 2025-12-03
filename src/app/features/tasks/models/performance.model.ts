export interface EmployeePerformance {
  employeeId: number;
  employeeName: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  completionRate: number; // النسبة المئوية
  performanceLabel: string; // Excellent, Good, etc.
}