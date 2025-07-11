/**
 * Interface générique pour les réponses API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
  path?: string;
}

/**
 * Interface pour les erreurs API
 */
export interface ApiError {
  code: string;
  message: string;
  details?: string[];
  stackTrace?: string;
}

/**
 * Interface pour les réponses paginées
 */
export interface PageResponse<T> {
  content: T[];
  pageable: Pageable;
  totalElements: number;
  totalPages: number;
  last: boolean;
  size: number;
  number: number;
  sort: Sort;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

/**
 * Interface pour les informations de pagination
 */
export interface Pageable {
  sort: Sort;
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
}

/**
 * Interface pour les informations de tri
 */
export interface Sort {
  sorted: boolean;
  unsorted: boolean;
  empty: boolean;
}

/**
 * Interface pour les critères de pagination
 */
export interface PaginationCriteria {
  page: number;
  size: number;
  sort?: string;
  direction?: 'asc' | 'desc';
} 