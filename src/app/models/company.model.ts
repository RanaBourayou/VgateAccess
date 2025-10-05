import { Supplier } from "./supplier.model";

export interface Company {
  idCompany: number;
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  suppliers?: Supplier[];  
}