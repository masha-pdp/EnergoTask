import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserLogViewService } from './user-log-view.service';
import {
  EVENT_TYPE_OPTIONS,
  HistoryDto,
  HistoryQuery,
  HistorySortColumn,
  LogTableColumnKey,
  PagedResult,
  SortDirection,
} from './user-log-view.models';

const DEFAULT_COLUMN_WIDTHS: Record<LogTableColumnKey, number> = {
  id: 72,
  text: 320,
  userFullName: 180,
  dt: 220,
  eventType: 160,
};

const MIN_COLUMN_WIDTH = 48;

@Component({
  selector: 'app-user-log-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-log-view.component.html',
  styleUrl: './user-log-view.component.css',
})
export class UserLogViewComponent implements OnInit, OnDestroy {
  /** Signals so the view updates under Angular’s default zoneless change detection. */
  protected readonly data = signal<HistoryDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly hasLoaded = signal(false);

  protected readonly page = signal(1);
  protected readonly pageSize = signal(10);
  protected readonly totalItems = signal(0);
  protected readonly totalPages = signal(0);

  protected readonly pageSizeOptions = [10, 20, 50];
  protected readonly eventTypeOptions = EVENT_TYPE_OPTIONS;

  protected readonly filterId = signal('');
  protected readonly filterText = signal('');
  protected readonly filterUserFullName = signal('');
  protected readonly filterDateFrom = signal('');
  protected readonly filterDateTo = signal('');
  protected readonly filterEventTypeId = signal<number | null>(null);

  protected readonly sortBy = signal<HistorySortColumn>('dt');
  protected readonly sortDirection = signal<SortDirection>('desc');

  protected readonly columnWidths = signal<Record<LogTableColumnKey, number>>({
    ...DEFAULT_COLUMN_WIDTHS,
  });

  private filterDebounceTimer: ReturnType<typeof setTimeout> | undefined;
  private resizeState: {
    column: LogTableColumnKey;
    startX: number;
    startWidth: number;
  } | null = null;

  private readonly onColumnResizeMove = (event: MouseEvent): void => {
    if (!this.resizeState) {
      return;
    }

    const delta = event.clientX - this.resizeState.startX;
    const nextWidth = Math.max(
      MIN_COLUMN_WIDTH,
      this.resizeState.startWidth + delta,
    );

    this.columnWidths.update((widths) => ({
      ...widths,
      [this.resizeState!.column]: nextWidth,
    }));
  };

  private readonly onColumnResizeEnd = (): void => {
    this.endColumnResize();
  };

  constructor(private service: UserLogViewService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  ngOnDestroy(): void {
    clearTimeout(this.filterDebounceTimer);
    this.endColumnResize();
  }

  protected columnWidth(column: LogTableColumnKey): number {
    return this.columnWidths()[column];
  }

  protected columnResizeLabel(column: LogTableColumnKey): string {
    const labels: Record<LogTableColumnKey, string> = {
      id: 'Id',
      text: 'Текст',
      userFullName: 'ФИО пользователя',
      dt: 'Дата',
      eventType: 'Тип события',
    };
    return `Изменить ширину столбца «${labels[column]}»`;
  }

  protected onColumnResizeStart(event: MouseEvent, column: LogTableColumnKey): void {
    event.preventDefault();
    event.stopPropagation();

    this.resizeState = {
      column,
      startX: event.clientX,
      startWidth: this.columnWidths()[column],
    };

    document.addEventListener('mousemove', this.onColumnResizeMove);
    document.addEventListener('mouseup', this.onColumnResizeEnd);
    document.body.classList.add('log-table--resizing');
  }

  private endColumnResize(): void {
    if (!this.resizeState) {
      return;
    }

    this.resizeState = null;
    document.removeEventListener('mousemove', this.onColumnResizeMove);
    document.removeEventListener('mouseup', this.onColumnResizeEnd);
    document.body.classList.remove('log-table--resizing');
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

  protected onPageSizeChange(value: number): void {
    if (!Number.isFinite(value) || value <= 0 || value === this.pageSize()) {
      return;
    }
    this.pageSize.set(value);
    this.page.set(1);
    this.loadHistory();
  }

  protected onTextFilterChange(value: string, field: 'text' | 'userFullName'): void {
    if (field === 'text') {
      this.filterText.set(value);
    } else {
      this.filterUserFullName.set(value);
    }
    this.scheduleFilterReload();
  }

  protected onIdFilterChange(value: string): void {
    this.filterId.set(value);
    this.scheduleFilterReload();
  }

  protected onDateFilterChange(): void {
    this.page.set(1);
    this.loadHistory();
  }

  protected onEventTypeFilterChange(value: number | null): void {
    this.filterEventTypeId.set(value);
    this.page.set(1);
    this.loadHistory();
  }

  protected clearFilters(): void {
    this.filterId.set('');
    this.filterText.set('');
    this.filterUserFullName.set('');
    this.filterDateFrom.set('');
    this.filterDateTo.set('');
    this.filterEventTypeId.set(null);
    this.page.set(1);
    this.loadHistory();
  }

  protected onSort(column: HistorySortColumn): void {
    if (this.sortBy() === column) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortBy.set(column);
      this.sortDirection.set('asc');
    }
    this.page.set(1);
    this.loadHistory();
  }

  protected isSortActive(column: HistorySortColumn): boolean {
    return this.sortBy() === column;
  }

  protected sortIcon(column: HistorySortColumn): string {
    if (!this.isSortActive(column)) {
      return '';
    }
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  protected ariaSort(column: HistorySortColumn): 'ascending' | 'descending' | 'none' {
    if (!this.isSortActive(column)) {
      return 'none';
    }
    return this.sortDirection() === 'asc' ? 'ascending' : 'descending';
  }

  protected hasActiveFilters(): boolean {
    return (
      this.filterId().trim() !== '' ||
      this.filterText().trim() !== '' ||
      this.filterUserFullName().trim() !== '' ||
      this.filterDateFrom() !== '' ||
      this.filterDateTo() !== '' ||
      this.filterEventTypeId() !== null
    );
  }

  private scheduleFilterReload(): void {
    clearTimeout(this.filterDebounceTimer);
    this.filterDebounceTimer = setTimeout(() => {
      this.page.set(1);
      this.loadHistory();
    }, 300);
  }

  private loadHistory(): void {
    this.loading.set(true);

    const query: HistoryQuery = {
      page: this.page(),
      pageSize: this.pageSize(),
      sortBy: this.sortBy(),
      sortDirection: this.sortDirection(),
      ...this.buildFilterQuery(),
    };

    this.service.getHistory(query).subscribe({
      next: (res: PagedResult<HistoryDto>) => {
        this.data.set(res.items ?? []);
        this.page.set(res.page);
        this.pageSize.set(res.pageSize > 0 ? res.pageSize : this.pageSize());
        this.totalItems.set(res.totalItems);
        this.totalPages.set(res.totalPages);
        this.loading.set(false);
        this.hasLoaded.set(true);
      },
      error: (err: unknown) => {
        console.error(err);
        this.data.set([]);
        this.totalItems.set(0);
        this.totalPages.set(0);
        this.loading.set(false);
        this.hasLoaded.set(true);
      },
    });
  }

  private buildFilterQuery(): Partial<HistoryQuery> {
    const query: Partial<HistoryQuery> = {};

    const idRaw = this.filterId().trim();
    if (idRaw !== '') {
      const id = Number.parseInt(idRaw, 10);
      if (Number.isFinite(id)) {
        query.id = id;
      }
    }

    const text = this.filterText().trim();
    if (text !== '') {
      query.text = text;
    }

    const userFullName = this.filterUserFullName().trim();
    if (userFullName !== '') {
      query.userFullName = userFullName;
    }

    const eventTypeId = this.filterEventTypeId();
    if (eventTypeId !== null) {
      query.eventTypeId = eventTypeId;
    }

    const dateFrom = this.filterDateFrom();
    if (dateFrom !== '') {
      query.dateFrom = dateFrom;
    }

    const dateTo = this.filterDateTo();
    if (dateTo !== '') {
      query.dateTo = `${dateTo}T23:59:59`;
    }

    return query;
  }
}
