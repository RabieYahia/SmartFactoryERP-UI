export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  status: string;   // Pending, InProgress, Completed
  priority: string; // Low, Medium, High
  assignedEmployeeId?: number;
  assignedEmployeeName?: string;
}