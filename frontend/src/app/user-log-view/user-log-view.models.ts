// user-log-view.models.ts

export interface HistoryDto {
    id: number;
    text: string;
    userFullName: string;
    dt: string;
    eventTypeName: string;
  }
  
  export interface PagedResult<T> {
    items: T[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  }
  
  export interface HistoryQuery {
    page: number;
    pageSize: number;
    text?: string;
    userFullName?: string;
    eventTypeId?: number;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortDirection?: string;
  }