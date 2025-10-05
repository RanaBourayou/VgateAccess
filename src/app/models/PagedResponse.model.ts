export interface PagedResponse<T> {
  number: number;
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}