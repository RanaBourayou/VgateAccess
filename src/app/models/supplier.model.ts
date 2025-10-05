export interface Supplier {
  idSupplier?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: { companyName: string };  
  companyName?: string;  
 }
