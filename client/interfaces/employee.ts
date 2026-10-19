export interface Employee {
  id: number;
  full_name: string;
  position?: string | null;
  birth_date?: Date | null; 
  address?: string | null;
  phone?: string | null;      
  note?: string | null;
}

export interface EmployeeShort {
  id: number;
  full_name: string;
  position?: string | null;
}

export type EmployeeCreate = Omit<Employee, "id">;
export type EmployeeUpdate = Partial<EmployeeCreate>;