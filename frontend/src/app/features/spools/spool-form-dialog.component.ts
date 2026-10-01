import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { NotificationService } from '../../core/http/notification.service';
import { Spool, SpoolService } from './spool.service';

export interface SpoolFormData {
  isoId: number;
  isoNo: string;
  spool: Spool | null;
}

//adds a spool to an iso, or renames one; closes with the saved spool
@Component({
  selector: 'app-spool-form-dialog',
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>{{ data.spool ? 'Edit spool' : 'New spool' }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="dialog-form">
        <p class="muted">ISO {{ data.isoNo }}</p>
        <mat-form-field appearance="outline">
          <mat-label>Spool number</mat-label>
          <input matInput formControlName="spoolNo" maxlength="50" cdkFocusInitial>
          <mat-hint>Must be unique within this ISO</mat-hint>
          @if (form.controls.spoolNo.hasError('required')) {
            <mat-error>Spool number is required</mat-error>
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
export class SpoolFormDialogComponent {

  private readonly spoolService = inject(SpoolService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<SpoolFormDialogComponent>);
  protected readonly data = inject<SpoolFormData>(MAT_DIALOG_DATA);

  protected readonly form = new FormGroup({
    spoolNo: new FormControl(this.data.spool?.spoolNo ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(50)]
    })
  });
  protected readonly saving = signal(false);

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const spoolNo = this.form.controls.spoolNo.value.trim();
    const save$ = this.data.spool
      ? this.spoolService.update(this.data.spool.id, spoolNo)
      : this.spoolService.create(this.data.isoId, spoolNo);

    this.saving.set(true);
    save$.subscribe({
      next: saved => {
        this.notification.success(`Spool ${saved.spoolNo} saved`);
        this.dialogRef.close(saved);
      },
      error: () => this.saving.set(false)
    });
  }
}
