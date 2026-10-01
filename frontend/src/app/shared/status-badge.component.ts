import { Component, computed, input } from '@angular/core';

const LABELS: Record<string, string> = {
  NEW: 'New',
  PENDING_MATERIAL: 'Pending material',
  BATCHED: 'Batched',
  UNVERIFIED: 'Unverified',
  UNDER_VERIFICATION: 'Under verification',
  VERIFIED: 'Verified'
};

//coloured badge for spool and iso statuses
@Component({
  selector: 'app-status-badge',
  template: `<span class="status" [class]="'status status-' + status().toLowerCase()">{{ label() }}</span>`
})
export class StatusBadgeComponent {
  readonly status = input.required<string>();
  protected readonly label = computed(() => LABELS[this.status()] ?? this.status());
}
