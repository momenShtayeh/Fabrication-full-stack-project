import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { NotificationService } from '../../core/http/notification.service';
import { Material, MaterialService } from './material.service';

//records a delivery: the quantity entered is added to the current stock by the backend
@Component({
  selector: 'app-receive-stock-dialog',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>Receive stock</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="dialog-form">
        <p>
          <strong>{{ material.code }}</strong> · {{ material.description }}<br>
          <span class="muted">Currently in stock: {{ material.quantity }}</span>
        </p>
        <mat-form-field appearance="outline">
          <mat-label>Quantity received</mat-label>
          <input matInput type="number" formControlName="quantity" min="1" step="1" cdkFocusInitial>
          <mat-hint>Added on top of the current stock</mat-hint>
          @if (form.controls.quantity.invalid) {
            <mat-error>Enter a whole number of 1 or more</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancel</button>
        <button mat-flat-button type="submit" [disabled]="saving()">Receive</button>
      </mat-dialog-actions>
    </form>
  `
})
export class ReceiveStockDialogComponent {

  private readonly materialService = inject(MaterialService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<ReceiveStockDialogComponent>);
  protected readonly material = inject<Material>(MAT_DIALOG_DATA);

  protected readonly form = new FormGroup({
    quantity: new FormControl<number | null>(null, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)])
  });
  protected readonly saving = signal(false);

  protected save(): void {
    const quantity = this.form.controls.quantity.value;
    if (this.form.invalid || quantity === null) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.materialService.receiveStock(this.material.id, quantity).subscribe({
      next: updated => {
        this.notification.success(`${updated.code} now has ${updated.quantity} in stock`);
        this.dialogRef.close(true);
      },
      error: () => this.saving.set(false)
    });
  }
}
