export interface UserDTO {
    userId: number;
    title: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    phone?: string;
    email: string;
    createdOn: Date;
    createdBy: string;
    modifiedOn?: Date;
    modifiedBy?: string;
    isActive: boolean;
  }