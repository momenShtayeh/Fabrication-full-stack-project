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
import { debounceTime, distinctUntilChanged, Observable, switchMap } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/http/notification.service';
import { ConfirmService } from '../../shared/confirm.service';
import { PagedLoader } from '../../shared/paged-loader';
import { MaterialFormDialogComponent } from './material-form-dialog.component';
import { Material, MaterialService } from './material.service';
import { ReceiveStockDialogComponent } from './receive-stock-dialog.component';

@Component({
  selector: 'app-material-list',
  imports: [
    MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatPaginatorModule,
    MatProgressBarModule, MatSortModule, MatTableModule, ReactiveFormsModule
  ],
  templateUrl: './material-list.component.html'
})
export class MaterialListComponent {

  private readonly materialService = inject(MaterialService);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly notification = inject(NotificationService);
  protected readonly auth = inject(AuthService);

  protected readonly search = new FormControl('', { nonNullable: true });
  protected readonly list = new PagedLoader<Material>(
    request => this.materialService.list(this.search.value.trim(), request),
    { page: 0, size: 10, sort: { active: 'code', direction: 'asc' } }
  );
  protected readonly columns = computed(() => this.auth.canEdit()
    ? ['code', 'description', 'quantity', 'actions']
    : ['code', 'description', 'quantity']);

  constructor() {
    this.search.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe(() => this.list.firstPage());
    this.list.reload();
  }

  protected openCreate(): void {
    this.reloadWhenSaved(this.dialog.open(MaterialFormDialogComponent, { data: null }).afterClosed());
  }

  protected openEdit(material: Material): void {
    this.reloadWhenSaved(this.dialog.open(MaterialFormDialogComponent, { data: material }).afterClosed());
  }

  protected openReceive(material: Material): void {
    this.reloadWhenSaved(this.dialog.open(ReceiveStockDialogComponent, { data: material }).afterClosed());
  }

  protected delete(material: Material): void {
    this.confirm.confirm({
      title: 'Delete material',
      message: `Delete ${material.code}? This cannot be undone.`,
      confirmText: 'Delete',
      destructive: true
    }).pipe(
      switchMap(() => this.materialService.delete(material.id))
    ).subscribe(() => {
      this.notification.success(`Material ${material.code} deleted`);
      this.list.reload();
    });
  }

  //the dialogs close with true after saving, and with nothing when cancelled
  private reloadWhenSaved(closed: Observable<boolean | undefined>): void {
    closed.subscribe(saved => {
      if (saved) {
        this.list.reload();
      }
    });
  }
}
