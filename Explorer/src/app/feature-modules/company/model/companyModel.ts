import { Equipment } from "../../equipment/model/equipmentModel";

export interface Company {
  name: string;
  adress: string;
  description: string;
  grade: string;
  equipmentSet: CompanyEquipment[];
}

export interface CompanyEquipment {
  name: string;
  description: string;
  typeOfEquipment: TypeOfEquipment;
  grade: string;
  price: number;
}

export enum TypeOfEquipment {
  Type1 = 'Therapeutic',
  Type2 = 'Surgical',
  Type3 = 'Dental',
  Type4 = 'Rehabilitation',
}