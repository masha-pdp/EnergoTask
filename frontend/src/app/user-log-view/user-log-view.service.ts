import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoryDto, PagedResult, HistoryQuery } from './user-log-view.models';

@Injectable({
  providedIn: 'root',
})
export class UserLogViewService {
  private baseUrl = 'http://localhost:5016/api/UserLogView';

  constructor(private http: HttpClient) {}

  getHistory(query: HistoryQuery): Observable<PagedResult<HistoryDto>> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize);

    params = this.setOptional(params, 'id', query.id);
    params = this.setOptional(params, 'text', query.text);
    params = this.setOptional(params, 'userFullName', query.userFullName);
    params = this.setOptional(params, 'eventTypeId', query.eventTypeId);
    params = this.setOptional(params, 'dateFrom', query.dateFrom);
    params = this.setOptional(params, 'dateTo', query.dateTo);
    params = this.setOptional(params, 'sortBy', query.sortBy);
    params = this.setOptional(params, 'sortDirection', query.sortDirection);

    return this.http.get<PagedResult<HistoryDto>>(this.baseUrl, { params });
  }

  private setOptional(
    params: HttpParams,
    key: string,
    value: string | number | undefined,
  ): HttpParams {
    if (value === undefined || value === null || value === '') {
      return params;
    }
    return params.set(key, String(value));
  }
}
