export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
}
// ... (Department & Employee موجودين)

// 👇 أضف هذا الموديل الجديد
export interface AttendanceLog {
  employeeId: number;
  employeeName: string;
  checkIn?: string;  // DateTime
  checkOut?: string; // DateTime
  status: string;    // "Present" or "Left"
}
export interface Employee {
  id: number;
  fullName: string;
  jobTitle: string;
  email: string;
  phoneNumber: string;
  departmentId: number;
  departmentName?: string; // للعرض فقط
}