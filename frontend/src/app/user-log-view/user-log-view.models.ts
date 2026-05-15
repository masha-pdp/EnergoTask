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
  
  export type HistorySortColumn =
    | 'id'
    | 'text'
    | 'userfullname'
    | 'dt'
    | 'eventtypename';

  export type SortDirection = 'asc' | 'desc';

  export interface HistoryQuery {
    page: number;
    pageSize: number;
    id?: number;
    text?: string;
    userFullName?: string;
    eventTypeId?: number;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: HistorySortColumn;
    sortDirection?: SortDirection;
  }

  export const EVENT_TYPE_OPTIONS = [
    { id: 1, name: 'Редактирование' },
    { id: 2, name: 'Добавление записи' },
    { id: 3, name: 'Удаление записи' },
  ] as const;

  export type LogTableColumnKey =
    | 'id'
    | 'text'
    | 'userFullName'
    | 'dt'
    | 'eventType';