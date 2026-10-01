import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { debounceTime, distinctUntilChanged, filter, map, Observable, switchMap } from 'rxjs';

import { NotificationService } from '../../core/http/notification.service';
import { Material, MaterialService } from '../materials/material.service';
import { SpoolMaterial, SpoolService } from './spool.service';

export interface SpoolMaterialDialogData {
  spoolId: number;
  //set when changing the quantity of an existing requirement, null when adding a material
  requirement: SpoolMaterial | null;
}

//adds a required material to a spool (picked by code, never by id), or changes a required quantity
@Component({
  selector: 'app-spool-material-dialog',
  imports: [MatAutocompleteModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
  template: `
    <h2 mat-dialog-title>{{ data.requirement ? 'Change required quantity' : 'Add required material' }}</h2>
    <form [formGroup]="form" (ngSubmit)="save()">
      <mat-dialog-content class="dialog-form">
        @if (data.requirement; as requirement) {
          <p><strong>{{ requirement.materialCode }}</strong> · {{ requirement.materialDescription }}</p>
        } @else {
          <mat-form-field appearance="outline">
            <mat-label>Material</mat-label>
            <input matInput formControlName="material" [matAutocomplete]="auto" placeholder="Type a material code"
                   cdkFocusInitial>
            <mat-autocomplete #auto="matAutocomplete" [displayWith]="displayMaterial">
              @for (option of options(); track option.id) {
                <mat-option [value]="option">
                  <strong>{{ option.code }}</strong> · {{ option.description }}
                  <span class="muted">({{ option.quantity }} in stock)</span>
                </mat-option>
              }
            </mat-autocomplete>
            @if (form.controls.material.invalid) {
              <mat-error>Choose a material from the list</mat-error>
            }
          </mat-form-field>
        }

        <mat-form-field appearance="outline">
          <mat-label>Required quantity</mat-label>
          <input matInput type="number" formControlName="quantity" min="1" step="1">
          @if (form.controls.quantity.invalid) {
            <mat-error>Enter a whole number of 1 or more</mat-error>
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
export class SpoolMaterialDialogComponent {

  private readonly spoolService = inject(SpoolService);
  private readonly materialService = inject(MaterialService);
  private readonly notification = inject(NotificationService);
  private readonly dialogRef = inject(MatDialogRef<SpoolMaterialDialogComponent>);
  protected readonly data = inject<SpoolMaterialDialogData>(MAT_DIALOG_DATA);

  protected readonly form = new FormGroup({
    //holds the typed text while searching, and the chosen Material once an option is picked;
    //not needed when only the quantity of an existing requirement changes
    material: new FormControl<Material | string | null>(
      { value: null, disabled: this.data.requirement !== null },
      [Validators.required, isMaterial]),
    quantity: new FormControl<number | null>(this.data.requirement?.qtyRequired ?? null,
      [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)])
  });
  protected readonly saving = signal(false);

  //suggestions from the backend's material search, refreshed as the user types
  protected readonly options = toSignal(this.searchMaterials(), { initialValue: [] });

  protected displayMaterial(material: Material | string | null): string {
    return typeof material === 'object' && material ? material.code : material ?? '';
  }

  protected save(): void {
    //a disabled control does not count, so the material is only checked when adding
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const requirement = this.data.requirement;
    const quantity = this.form.controls.quantity.value!;
    const save$ = requirement
      ? this.spoolService.updateMaterialQuantity(this.data.spoolId, requirement.id, quantity)
      : this.spoolService.addMaterial(this.data.spoolId, (this.form.controls.material.value as Material).id, quantity);

    this.saving.set(true);
    save$.subscribe({
      next: saved => {
        this.notification.success(`${saved.materialCode} × ${saved.qtyRequired} saved`);
        this.dialogRef.close(true);
      },
      error: () => this.saving.set(false)
    });
  }

  private searchMaterials(): Observable<Material[]> {
    return this.form.controls.material.valueChanges.pipe(
      filter((value): value is string => typeof value === 'string'),
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(search => this.materialService.list(search.trim(), {
        page: 0,
        size: 20,
        sort: { active: 'code', direction: 'asc' }
      })),
      map(page => page.content)
    );
  }
}

//only a material picked from the list is valid, not free text
function isMaterial(control: { value: unknown }): { notSelected: true } | null {
  return control.value === null || typeof control.value === 'object' ? null : { notSelected: true };
}
