import { signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { catchError, Observable, of, Subject, switchMap, tap } from 'rxjs';

import { Page, PageRequest } from '../core/http/api';

/*
 * Loads one page of a server side paginated list and keeps it in signals for the template.
 * Every list screen uses it, so paging, sorting and reloading behave the same everywhere.
 * switchMap cancels a request that is still running when a newer one starts (e.g. fast typing in a search box).
 * Must be created in a component field, as it stops itself when the component is destroyed.
 */
export class PagedLoader<T> {

  readonly page = signal<Page<T> | null>(null);
  readonly loading = signal(false);
  request: PageRequest;

  private readonly reload$ = new Subject<void>();

  constructor(fetch: (request: PageRequest) => Observable<Page<T>>, initialRequest: PageRequest) {
    this.request = initialRequest;
    this.reload$.pipe(
      tap(() => this.loading.set(true)),
      switchMap(() => fetch(this.request).pipe(catchError(() => of(null)))),
      takeUntilDestroyed()
    ).subscribe(page => {
      this.loading.set(false);
      if (page) {
        this.page.set(page);
      }
    });
  }

  reload(): void {
    this.reload$.next();
  }

  firstPage(): void {
    this.request = { ...this.request, page: 0 };
    this.reload();
  }

  changePage(event: PageEvent): void {
    this.request = { ...this.request, page: event.pageIndex, size: event.pageSize };
    this.reload();
  }

  changeSort(sort: Sort): void {
    this.request = { ...this.request, page: 0, sort: { active: sort.active, direction: sort.direction } };
    this.reload();
  }
}
