import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE } from '../../core/http/api';

export interface DashboardSummary {
  totalIsos: number;
  totalSpools: number;
  availableMaterials: number;
  generatedBatches: number;
  pendingSpools: number;
  newSpools: number;
  batchedSpools: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {

  private readonly http = inject(HttpClient);

  summary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${API_BASE}/dashboard`);
  }
}
