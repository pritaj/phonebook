export class CreateEmployeeDto {
    lastName:string;
    firstName:string;
    departmentId:number;
    phone?:string;
    email?:string;
    position?:string;
    inside?:boolean;
}
