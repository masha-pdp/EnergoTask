import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserLogViewService } from './user-log-view.service';
import { HistoryDto, HistoryQuery, PagedResult } from './user-log-view.models';

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

  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly totalItems = signal(0);
  protected readonly totalPages = signal(0);

  protected readonly pageSizeOptions = [10, 20, 50];

  constructor(private service: UserLogViewService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  protected previousPage(): void {
    this.goToPage(this.page() - 1);
  }

  protected nextPage(): void {
    this.goToPage(this.page() + 1);
  }

  protected goToPage(page: number): void {
    const total = this.totalPages();
    if (page < 1 || (total > 0 && page > total) || page === this.page()) {
      return;
    }
    this.page.set(page);
    this.loadHistory();
  }

  protected onPageSizeChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    if (!Number.isFinite(value) || value <= 0 || value === this.pageSize()) {
      return;
    }
    this.pageSize.set(value);
    this.page.set(1);
    this.loadHistory();
  }

  private loadHistory(): void {
    this.loading.set(true);

    const query: HistoryQuery = {
      page: this.page(),
      pageSize: this.pageSize(),
    };

    this.service.getHistory(query).subscribe({
      next: (res: PagedResult<HistoryDto>) => {
        this.data.set(res.items ?? []);
        this.page.set(res.page);
        this.pageSize.set(res.pageSize);
        this.totalItems.set(res.totalItems);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        console.error(err);
        this.data.set([]);
        this.totalItems.set(0);
        this.totalPages.set(0);
        this.loading.set(false);
      },
    });
  }
}
