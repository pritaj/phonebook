export interface Employee {
  id: number;
  lastName: string;
  firstName: string;
  departmentId: number;
  phone: string | null;
  email: string | null;
  position: string | null;
  inside: boolean;
}

export interface Department {
  id: number;
  nameHu: string;
  nameEn: string | null;
  parentId: number | null;
  children: Department[];
  employees: Employee[];
}
