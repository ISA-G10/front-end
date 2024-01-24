import { CompanyEquipment } from "../../company/model/companyModel";

export interface Reservation {
    id?: number;
    dateTime: Date;
    duration: number; 
    grade: number;
    status: ReservationStatus;
    customerId: number;
    companyAdminId: number;
    reservationEquipments: CompanyEquipment[];
}

export enum ReservationStatus {
    Pending = 'Pending',
    Confirmed = 'Confirmed',
    Cancelled = 'Cancelled',
  }
