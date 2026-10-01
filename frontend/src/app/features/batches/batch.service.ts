import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE, Page, PageRequest, toPageParams } from '../../core/http/api';
import { Spool } from '../spools/spool.service';

export interface Batch {
  id: number;
  batchNo: string;
  createdDate: string;
}

export type SkipReason = 'MATERIAL_SHORTAGE' | 'ISO_NOT_VERIFIED' | 'NO_MATERIALS';

export interface MaterialShortage {
  materialCode: string;
  required: number;
  available: number;
}

//a spool a batch generation left out and why; spoolId is null when the spool was deleted afterwards
export interface SkippedSpool {
  spoolId: number | null;
  isoNo: string;
  spoolNo: string;
  reason: SkipReason;
  shortages: MaterialShortage[];
}

export interface MaterialUsage {
  materialCode: string;
  description: string;
  quantity: number;
}

//a batch with its report
export interface BatchDetail extends Batch {
  spools: Spool[];
  materialsUsed: MaterialUsage[];
  skippedSpools: SkippedSpool[];
}

//batch is null when no spool could be batched, skippedSpools says why either way
export interface BatchGeneration {
  batch: BatchDetail | null;
  skippedSpools: SkippedSpool[];
}

@Injectable({ providedIn: 'root' })
export class BatchService {

  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/batches`;

  list(request: PageRequest): Observable<Page<Batch>> {
    return this.http.get<Page<Batch>>(this.url, { params: toPageParams(request) });
  }

  get(id: number): Observable<BatchDetail> {
    return this.http.get<BatchDetail>(`${this.url}/${id}`);
  }

  generate(): Observable<BatchGeneration> {
    return this.http.post<BatchGeneration>(`${this.url}/generate`, null);
  }

  cancel(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
