import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { NotificationService } from '../../core/http/notification.service';
import { Material, MaterialService } from './material.service';

//creates a material, or edits the one passed in; closes with true once saved
@Component({
  selector: 'app-material-form-dialog',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>{{ material ? 'Edit material' : 'New material' }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Material code</mat-label>
          <input matInput formControlName="code" maxlength="50" cdkFocusInitial>
          @if (form.controls.code.hasError('required')) {
            <mat-error>Code is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <input matInput formControlName="description" maxlength="255">
          @if (form.controls.description.hasError('required')) {
            <mat-error>Description is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Available quantity</mat-label>
          <input matInput type="number" formControlName="quantity" min="0" step="1">
          @if (material) {
            <mat-hint>To record a delivery, use "Receive stock" instead</mat-hint>
          }
          @if (form.controls.quantity.hasError('required')) {
            <mat-error>Quantity is required</mat-error>
          } @else if (form.controls.quantity.invalid) {
            <mat-error>Quantity must be a whole number of 0 or more</mat-error>
          }
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancel</button>
        <button mat-flat-button type="submit" [disabled]="saving()">Save</button>
      </mat-dialog-actions>
    </form>
  `
})
export class MaterialFormDialogComponent {

  private readonly materialService = inject(MaterialService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<MaterialFormDialogComponent>);
  protected readonly material = inject<Material | null>(MAT_DIALOG_DATA);

  //same rules as MaterialRequest in the backend
  protected readonly form = inject(FormBuilder).nonNullable.group({
    code: [this.material?.code ?? '', [Validators.required, Validators.maxLength(50)]],
    description: [this.material?.description ?? '', [Validators.required, Validators.maxLength(255)]],
    quantity: [this.material?.quantity ?? 0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]]
  });
  protected readonly saving = signal(false);

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.form.getRawValue();
    const save$ = this.material
      ? this.materialService.update(this.material.id, request)
      : this.materialService.create(request);

    //on an error the dialog stays open so the user can correct the input, the error interceptor shows the message
    this.saving.set(true);
    save$.subscribe({
      next: saved => {
        this.notification.success(`Material ${saved.code} saved`);
        this.dialogRef.close(true);
      },
      error: () => this.saving.set(false)
    });
  }
}
