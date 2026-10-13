export interface Person {
  ID: number;
  DepID: number;
  FirstName: string;
  LastName: string;
  Phone: string | null;
  inside: boolean;
}

export interface Department {
  ID: number;
  IdFrom: number;
  Name_hu: string;
  Name_en: string;
  departments: Department[];
  people: Person[];
}
