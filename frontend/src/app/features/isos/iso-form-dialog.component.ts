import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { NotificationService } from '../../core/http/notification.service';
import { Iso, ISO_STATUSES, IsoService, IsoStatus } from './iso.service';

//creates an iso, or edits the one passed in; closes with the saved iso
@Component({
  selector: 'app-iso-form-dialog',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>{{ iso ? 'Edit ISO' : 'New ISO' }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>ISO number</mat-label>
          <input matInput formControlName="isoNo" maxlength="50" cdkFocusInitial>
          @if (form.controls.isoNo.hasError('required')) {
            <mat-error>ISO number is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Revision</mat-label>
          <input matInput formControlName="revision" maxlength="10">
          <mat-hint>A number or letter, e.g. 0, 1, A, B</mat-hint>
          @if (form.controls.revision.hasError('required')) {
            <mat-error>Revision is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            @for (status of statuses; track status.value) {
              <mat-option [value]="status.value">{{ status.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" mat-dialog-close>Cancel</button>
        <button mat-flat-button type="submit" [disabled]="saving()">Save</button>
      </mat-dialog-actions>
    </form>
  `
})
export class IsoFormDialogComponent {

  private readonly isoService = inject(IsoService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<IsoFormDialogComponent>);
  protected readonly iso = inject<Iso | null>(MAT_DIALOG_DATA);
  protected readonly statuses = ISO_STATUSES;

  //same rules as IsoRequest in the backend
  protected readonly form = inject(FormBuilder).nonNullable.group({
    isoNo: [this.iso?.isoNo ?? '', [Validators.required, Validators.maxLength(50)]],
    revision: [this.iso?.revision ?? '', [Validators.required, Validators.maxLength(10)]],
    status: [this.iso?.status ?? 'UNVERIFIED' as IsoStatus, Validators.required]
  });
  protected readonly saving = signal(false);

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const request = this.form.getRawValue();
    const save$ = this.iso ? this.isoService.update(this.iso.id, request) : this.isoService.create(request);

    this.saving.set(true);
    save$.subscribe({
      next: saved => {
        this.notification.success(`ISO ${saved.isoNo} saved`);
        this.dialogRef.close(saved);
      },
      error: () => this.saving.set(false)
    });
  }
}
