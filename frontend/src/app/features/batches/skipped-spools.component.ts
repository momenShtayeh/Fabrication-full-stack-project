import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { SkippedSpool, SkipReason } from './batch.service';

interface ReasonGroup {
  reason: SkipReason;
  title: string;
  explanation: string;
  icon: string;
  spools: SkippedSpool[];
}

const REASONS: Omit<ReasonGroup, 'spools'>[] = [
  {
    reason: 'MATERIAL_SHORTAGE',
    title: 'Short of material',
    explanation: 'Marked as pending material until the stock arrives.',
    icon: 'inventory'
  },
  {
    reason: 'ISO_NOT_VERIFIED',
    title: 'ISO not verified',
    explanation: 'Only spools of verified ISOs are fabricated, these were not checked.',
    icon: 'rule'
  },
  {
    reason: 'NO_MATERIALS',
    title: 'No required materials',
    explanation: 'Add the materials these spools need before they can be batched.',
    icon: 'playlist_remove'
  }
];

//the part of a batch report that explains every spool left out, grouped by the reason
@Component({
  selector: 'app-skipped-spools',
  imports: [MatIconModule, NgTemplateOutlet, RouterLink],
  templateUrl: './skipped-spools.component.html',
  styleUrl: './skipped-spools.component.css'
})
export class SkippedSpoolsComponent {

  readonly spools = input.required<SkippedSpool[]>();

  protected readonly groups = computed<ReasonGroup[]>(() => REASONS
    .map(reason => ({ ...reason, spools: this.spools().filter(spool => spool.reason === reason.reason) }))
    .filter(group => group.spools.length > 0));
}
