// user-log-view.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoryDto, PagedResult, HistoryQuery } from './user-log-view.models';

@Injectable({
  providedIn: 'root'
})
export class UserLogViewService {

  private baseUrl = 'http://localhost:5016/api/UserLogView';

  constructor(private http: HttpClient) {}

  getHistory(query: HistoryQuery): Observable<PagedResult<HistoryDto>> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize);

    return this.http.get<PagedResult<HistoryDto>>(this.baseUrl, { params });
  }
}