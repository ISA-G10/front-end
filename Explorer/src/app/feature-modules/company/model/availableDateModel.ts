import { CompanyAdminRegistration } from "../../user/model/companyAdminModel";

export interface AvailableDate {
    id?: number;
    adminId: number | 0;
    startTime: string;
    duration: number;
    adminConfirmationTime: Date;
    confirmed: boolean;
    selected: boolean;
  }