import { Component, effect, inject, input, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { PagedLoader } from '../../shared/paged-loader';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { Spool, SPOOL_STATUSES, SpoolService, SpoolStatus } from './spool.service';

//every spool across all isos, filtering by "Pending material" lists the spools that could not be batched
@Component({
  selector: 'app-spool-list',
  imports: [
    MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatProgressBarModule, MatSelectModule,
    MatSortModule, MatTableModule, ReactiveFormsModule, RouterLink, StatusBadgeComponent
  ],
  templateUrl: './spool-list.component.html'
})
export class SpoolListComponent {

  private readonly spoolService = inject(SpoolService);
  private readonly router = inject(Router);

  //lets other pages link to a filtered list, e.g. /spools?status=PENDING_MATERIAL
  readonly status = input<SpoolStatus>();

  protected readonly statuses = SPOOL_STATUSES;
  protected readonly columns = ['spoolNo', 'iso', 'status'];
  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly statusFilter = new FormControl<SpoolStatus | null>(null);
  protected readonly list = new PagedLoader<Spool>(
    request => this.spoolService.search(this.search.value.trim(), this.statusFilter.value, request),
    { page: 0, size: 10, sort: { active: 'spoolNo', direction: 'asc' } }
  );

  constructor() {
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.list.firstPage());
    this.statusFilter.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.list.firstPage());

    //loads the list, and again whenever a link changes the ?status= in the url while this page is open
    effect(() => {
      const status = this.status() ?? null;
      untracked(() => {
        this.statusFilter.setValue(status, { emitEvent: false });
        this.list.firstPage();
      });
    });
  }

  protected open(spool: Spool): void {
    this.router.navigate(['/spools', spool.id]);
  }
}
