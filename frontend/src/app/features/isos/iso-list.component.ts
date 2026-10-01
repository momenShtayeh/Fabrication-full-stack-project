import { Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/http/notification.service';
import { ConfirmService } from '../../shared/confirm.service';
import { PagedLoader } from '../../shared/paged-loader';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { IsoFormDialogComponent } from './iso-form-dialog.component';
import { Iso, IsoService } from './iso.service';

@Component({
  selector: 'app-iso-list',
  imports: [
    MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatPaginatorModule,
    MatProgressBarModule, MatSortModule, MatTableModule, ReactiveFormsModule, StatusBadgeComponent
  ],
  templateUrl: './iso-list.component.html'
})
export class IsoListComponent {

  private readonly isoService = inject(IsoService);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly list = new PagedLoader<Iso>(
    request => this.isoService.list(this.search.value.trim(), request),
    { page: 0, size: 10, sort: { active: 'isoNo', direction: 'asc' } }
  );
  protected readonly columns = computed(() => this.auth.canEdit()
    ? ['isoNo', 'revision', 'status', 'actions']
    : ['isoNo', 'revision', 'status']);

  constructor() {
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.list.firstPage());
    this.list.reload();
  }

  protected open(iso: Iso): void {
    this.router.navigate(['/isos', iso.id]);
  }

  //a new iso opens straight away, so its spools can be added next
  protected openCreate(): void {
    this.dialog.open(IsoFormDialogComponent, { data: null }).afterClosed().subscribe((saved?: Iso) => {
      if (saved) {
        this.open(saved);
      }
    });
  }

  protected openEdit(iso: Iso): void {
    this.dialog.open(IsoFormDialogComponent, { data: iso }).afterClosed().subscribe((saved?: Iso) => {
      if (saved) {
        this.list.reload();
      }
    });
  }

  protected delete(iso: Iso): void {
    this.confirm.confirm({
      title: 'Delete ISO',
      message: `Delete ${iso.isoNo} together with its spools and their material requirements? This cannot be undone.`,
      confirmText: 'Delete',
      destructive: true
    }).pipe(
      switchMap(() => this.isoService.delete(iso.id))
    ).subscribe(() => {
      this.notification.success(`ISO ${iso.isoNo} deleted`);
      this.list.reload();
    });
  }
}
