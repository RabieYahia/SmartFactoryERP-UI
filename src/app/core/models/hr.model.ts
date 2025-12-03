export interface Department {
  id: number;
  name: string;
  code: string;
  description?: string;
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