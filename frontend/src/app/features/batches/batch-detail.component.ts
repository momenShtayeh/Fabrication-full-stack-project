import { DatePipe } from '@angular/common';
import { Component, effect, inject, input, numberAttribute, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/http/notification.service';
import { ConfirmService } from '../../shared/confirm.service';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { Spool } from '../spools/spool.service';
import { BatchDetail, BatchService } from './batch.service';
import { SkippedSpoolsComponent } from './skipped-spools.component';

@Component({
  selector: 'app-batch-detail',
  imports: [
    DatePipe, MatButtonModule, MatIconModule, MatProgressBarModule, MatTableModule, RouterLink, SkippedSpoolsComponent,
    StatusBadgeComponent
  ],
  templateUrl: './batch-detail.component.html'
})
export class BatchDetailComponent {

  private readonly batchService = inject(BatchService);
  private readonly confirm = inject(ConfirmService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  //the :id from the url
  readonly id = input.required({ transform: numberAttribute });

  protected readonly batch = signal<BatchDetail | null>(null);
  protected readonly columns = ['spoolNo', 'iso', 'status'];
  protected readonly materialColumns = ['material', 'description', 'quantity'];

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => {
        this.batch.set(null);
        this.batchService.get(id).subscribe(batch => this.batch.set(batch));
      });
    });
  }

  protected openSpool(spool: Spool): void {
    this.router.navigate(['/spools', spool.id]);
  }

  protected cancel(batch: BatchDetail): void {
    this.confirm.confirm({
      title: 'Cancel batch',
      message: `Cancel ${batch.batchNo}? Its ${batch.spools.length} spool(s) go back to New and their materials `
        + 'are returned to stock. Pending spools whose materials are then all in stock also go back to New.',
      confirmText: 'Cancel batch',
      cancelText: 'Keep batch',
      destructive: true
    }).pipe(
      switchMap(() => this.batchService.cancel(batch.id))
    ).subscribe(() => {
      this.notification.success(`Batch ${batch.batchNo} cancelled, its materials are back in stock`);
      this.router.navigate(['/batches']);
    });
  }
}
