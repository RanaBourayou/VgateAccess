export interface AuthResponse {
    id?: number;
  token: string;
  role: string;
  email?: string;
  firstName?: string;
  lastName?: string;
   departmentId: number; 
    mustChangePassword: boolean; 

}