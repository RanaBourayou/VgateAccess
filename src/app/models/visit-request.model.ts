  import { User } from "./user.model";
  import { Visitor } from "./visitor.model";
import { Companion } from "./companion.model";

  export interface VisitRequest {
 
     idVisitRequest?: number;
    visitDate: string;  
    expectedArrival: string;
    expectedDeparture: string;
    visitPurpose?: string;
    visitRequestStatus: VisitRequestStatus;
    requester?: User;
    visitor?: Visitor;
    personneConcernee?: string;
      additionalGuests?: Companion[]; 
      admin_approval?: boolean;  

  }

  export enum VisitRequestStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
     ARRIVED      = 'ARRIVED',       
  WAITING      = 'WAITING',
  ABSENT = "ABSENT",  
  COMPLETED = 'COMPLETED'    
  }
