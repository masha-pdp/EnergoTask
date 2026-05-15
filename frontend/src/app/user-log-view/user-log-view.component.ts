import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserLogViewService } from './user-log-view.service';
import { HistoryDto, PagedResult } from './user-log-view.models';

@Component({
  selector: 'app-user-log-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-log-view.component.html',
  styleUrl: './user-log-view.component.css',
})
export class UserLogViewComponent implements OnInit {
  /** Signals so the view updates under Angular’s default zoneless change detection. */
  protected readonly data = signal<HistoryDto[]>([]);
  protected readonly loading = signal(true);

  constructor(private service: UserLogViewService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.service.getHistory({ page: 1, pageSize: 10 }).subscribe({
      next: (res: PagedResult<HistoryDto>) => {
        this.data.set(res.items ?? []);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error(err);
        this.data.set([]);
        this.loading.set(false);
      },
    });
  }
}
