import { Component, computed, effect, inject, input, numberAttribute, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/http/notification.service';
import { ConfirmService } from '../../shared/confirm.service';
import { PagedLoader } from '../../shared/paged-loader';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { SpoolFormDialogComponent, SpoolFormData } from '../spools/spool-form-dialog.component';
import { Spool, SpoolService } from '../spools/spool.service';
import { IsoFormDialogComponent } from './iso-form-dialog.component';
import { Iso, IsoService } from './iso.service';

//one iso and the spools that belong to it, spools are added here so the iso is always known
@Component({
  selector: 'app-iso-detail',
  imports: [
    MatButtonModule, MatIconModule, MatMenuModule, MatPaginatorModule, MatProgressBarModule, MatSortModule,
    MatTableModule, MatTooltipModule, RouterLink, StatusBadgeComponent
  ],
  templateUrl: './iso-detail.component.html'
})
export class IsoDetailComponent {

  private readonly isoService = inject(IsoService);
  private readonly spoolService = inject(SpoolService);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  //the :id from the url
  readonly id = input.required({ transform: numberAttribute });

  protected readonly iso = signal<Iso | null>(null);
  protected readonly spools = new PagedLoader<Spool>(
    request => this.spoolService.listByIso(this.id(), request),
    { page: 0, size: 10, sort: { active: 'spoolNo', direction: 'asc' } }
  );
  protected readonly columns = computed(() => this.auth.canEdit()
    ? ['spoolNo', 'status', 'actions']
    : ['spoolNo', 'status']);

  constructor() {
    //runs again if the url changes to another iso while this page is open, untracked keeps id() the only trigger
    effect(() => {
      const id = this.id();
      untracked(() => {
        this.iso.set(null);
        this.isoService.get(id).subscribe(iso => this.iso.set(iso));
        this.spools.firstPage();
      });
    });
  }

  protected openSpool(spool: Spool): void {
    this.router.navigate(['/spools', spool.id]);
  }

  protected editIso(iso: Iso): void {
    this.dialog.open(IsoFormDialogComponent, { data: iso }).afterClosed().subscribe((saved?: Iso) => {
      if (saved) {
        this.iso.set(saved);
      }
    });
  }

  protected deleteIso(iso: Iso): void {
    this.confirm.confirm({
      title: 'Delete ISO',
      message: `Delete ${iso.isoNo} together with its spools and their material requirements? This cannot be undone.`,
      confirmText: 'Delete',
      destructive: true
    }).pipe(
      switchMap(() => this.isoService.delete(iso.id))
    ).subscribe(() => {
      this.notification.success(`ISO ${iso.isoNo} deleted`);
      this.router.navigate(['/isos']);
    });
  }

  //a new spool opens straight away, so its materials can be added next
  protected addSpool(iso: Iso): void {
    const data: SpoolFormData = { isoId: iso.id, isoNo: iso.isoNo, spool: null };
    this.dialog.open(SpoolFormDialogComponent, { data }).afterClosed().subscribe((saved?: Spool) => {
      if (saved) {
        this.openSpool(saved);
      }
    });
  }

  protected editSpool(iso: Iso, spool: Spool): void {
    const data: SpoolFormData = { isoId: iso.id, isoNo: iso.isoNo, spool };
    this.dialog.open(SpoolFormDialogComponent, { data }).afterClosed().subscribe((saved?: Spool) => {
      if (saved) {
        this.spools.reload();
      }
    });
  }

  protected deleteSpool(spool: Spool): void {
    this.confirm.confirm({
      title: 'Delete spool',
      message: `Delete spool ${spool.spoolNo} and its material requirements? This cannot be undone.`,
      confirmText: 'Delete',
      destructive: true
    }).pipe(
      switchMap(() => this.spoolService.delete(spool.id))
    ).subscribe(() => {
      this.notification.success(`Spool ${spool.spoolNo} deleted`);
      this.spools.reload();
    });
  }
}
