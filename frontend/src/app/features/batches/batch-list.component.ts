import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { Router } from '@angular/router';
import { finalize, switchMap, tap } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { ConfirmService } from '../../shared/confirm.service';
import { PagedLoader } from '../../shared/paged-loader';
import { Batch, BatchGeneration, BatchService } from './batch.service';
import { GenerationResultComponent } from './generation-result.component';

@Component({
  selector: 'app-batch-list',
  imports: [
    DatePipe, GenerationResultComponent, MatButtonModule, MatIconModule, MatPaginatorModule, MatProgressBarModule,
    MatSortModule, MatTableModule
  ],
  templateUrl: './batch-list.component.html'
})
export class BatchListComponent {

  private readonly batchService = inject(BatchService);
  private readonly confirm = inject(ConfirmService);
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  protected readonly columns = ['batchNo', 'createdDate'];
  protected readonly list = new PagedLoader<Batch>(
    request => this.batchService.list(request),
    { page: 0, size: 10, sort: { active: 'createdDate', direction: 'desc' } }
  );
  protected readonly generating = signal(false);
  protected readonly result = signal<BatchGeneration | null>(null);

  constructor() {
    this.list.reload();
  }

  protected open(batch: Batch): void {
    this.router.navigate(['/batches', batch.id]);
  }

  protected generate(): void {
    this.confirm.confirm({
      title: 'Generate batch',
      message: 'Every spool whose required materials are all in stock will be batched, and that stock will be '
        + 'deducted. Spools that are short of material will be marked as pending material.',
      confirmText: 'Generate'
    }).pipe(
      tap(() => this.generating.set(true)),
      switchMap(() => this.batchService.generate().pipe(finalize(() => this.generating.set(false))))
    ).subscribe(result => {
      this.result.set(result);
      this.list.firstPage();
    });
  }
}
