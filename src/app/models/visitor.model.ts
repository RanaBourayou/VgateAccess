export interface Visitor {
  idVisitor?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: number;
  companyName?: string;
  cin?: number;
  passportNumber?: number;
  visitorType?: VisitorType;
companyId?: number | null;

}
export enum VisitorType {
  SUPPLIER = 'SUPPLIER',
  INTERN = 'INTERN',
  CANDIDATE = 'CANDIDATE',
  GUEST = 'GUEST'
}
