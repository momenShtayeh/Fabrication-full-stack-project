import { Component, computed, effect, inject, input, numberAttribute, signal, untracked } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { NotificationService } from '../../core/http/notification.service';
import { ConfirmService } from '../../shared/confirm.service';
import { StatusBadgeComponent } from '../../shared/status-badge.component';
import { SpoolMaterialDialogComponent, SpoolMaterialDialogData } from './spool-material-dialog.component';
import { Spool, SpoolMaterial, SpoolService } from './spool.service';

//one spool and the materials it requires, with how much of each is in stock right now
@Component({
  selector: 'app-spool-detail',
  imports: [
    MatButtonModule, MatIconModule, MatMenuModule, MatProgressBarModule, MatTableModule, RouterLink,
    StatusBadgeComponent
  ],
  templateUrl: './spool-detail.component.html'
})
export class SpoolDetailComponent {

  private readonly spoolService = inject(SpoolService);
  private readonly dialog = inject(MatDialog);
  private readonly confirm = inject(ConfirmService);
  private readonly notification = inject(NotificationService);
  protected readonly auth = inject(AuthService);

  //the :id from the url
  readonly id = input.required({ transform: numberAttribute });

  protected readonly spool = signal<Spool | null>(null);
  protected readonly materials = signal<SpoolMaterial[]>([]);
  protected readonly loadingMaterials = signal(false);

  //a batched spool's stock was already deducted, so its requirements are locked (backend rule)
  protected readonly isLocked = computed(() => this.spool()?.status === 'BATCHED');
  protected readonly canChange = computed(() => this.auth.canEdit() && !this.isLocked());
  protected readonly shortCount = computed(() =>
    this.materials().filter(requirement => requirement.availableQuantity < requirement.qtyRequired).length);
  protected readonly columns = computed(() => this.canChange()
    ? ['material', 'description', 'required', 'available', 'actions']
    : ['material', 'description', 'required', 'available']);

  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => {
        this.spool.set(null);
        this.spoolService.get(id).subscribe(spool => this.spool.set(spool));
        this.loadMaterials();
      });
    });
  }

  protected addMaterial(): void {
    this.openMaterialDialog({ spoolId: this.id(), requirement: null });
  }

  protected changeQuantity(requirement: SpoolMaterial): void {
    this.openMaterialDialog({ spoolId: this.id(), requirement });
  }

  protected removeMaterial(requirement: SpoolMaterial): void {
    this.confirm.confirm({
      title: 'Remove material',
      message: `Remove ${requirement.materialCode} from this spool's requirements?`,
      confirmText: 'Remove',
      destructive: true
    }).pipe(
      switchMap(() => this.spoolService.removeMaterial(this.id(), requirement.id))
    ).subscribe(() => {
      this.notification.success(`${requirement.materialCode} removed`);
      this.loadMaterials();
    });
  }

  private openMaterialDialog(data: SpoolMaterialDialogData): void {
    this.dialog.open(SpoolMaterialDialogComponent, { data, width: '520px' }).afterClosed().subscribe(saved => {
      if (saved) {
        this.loadMaterials();
      }
    });
  }

  private loadMaterials(): void {
    this.loadingMaterials.set(true);
    this.spoolService.materials(this.id()).subscribe({
      next: materials => {
        this.materials.set(materials);
        this.loadingMaterials.set(false);
      },
      error: () => this.loadingMaterials.set(false)
    });
  }
}
