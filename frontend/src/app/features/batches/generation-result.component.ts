import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

import { BatchGeneration } from './batch.service';
import { SkippedSpoolsComponent } from './skipped-spools.component';

//what the last "Generate batch" did: the spools it batched and every spool it left out, with the reason
@Component({
  selector: 'app-generation-result',
  imports: [MatIconModule, RouterLink, SkippedSpoolsComponent],
  templateUrl: './generation-result.component.html',
  styleUrl: './generation-result.component.css'
})
export class GenerationResultComponent {
  readonly result = input.required<BatchGeneration>();
}
