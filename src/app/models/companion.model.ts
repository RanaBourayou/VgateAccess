export interface Companion {
  idCompanion?: number;
  firstNameGuest: string;
  lastNameGuest: string;
  email: string;
  phoneNumber?: number;
  arrival: string;    // ISO string date-time expected
  departure: string;  // ISO string date-time expected
}