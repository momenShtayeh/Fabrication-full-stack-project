import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE, Page, PageRequest, toPageParams } from '../../core/http/api';

export type SpoolStatus = 'NEW' | 'PENDING_MATERIAL' | 'BATCHED';

export const SPOOL_STATUSES: { value: SpoolStatus; label: string }[] = [
  { value: 'NEW', label: 'New' },
  { value: 'PENDING_MATERIAL', label: 'Pending material' },
  { value: 'BATCHED', label: 'Batched' }
];

export interface Spool {
  id: number;
  spoolNo: string;
  isoId: number;
  isoNo: string;
  status: SpoolStatus;
}

//one material a spool needs, with the stock currently available for it
export interface SpoolMaterial {
  id: number;
  materialId: number;
  materialCode: string;
  materialDescription: string;
  qtyRequired: number;
  availableQuantity: number;
}

@Injectable({ providedIn: 'root' })
export class SpoolService {

  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/spools`;

  listByIso(isoId: number, request: PageRequest): Observable<Page<Spool>> {
    return this.http.get<Page<Spool>>(`${API_BASE}/isos/${isoId}/spools`, { params: toPageParams(request) });
  }

  search(search: string, status: SpoolStatus | null, request: PageRequest): Observable<Page<Spool>> {
    return this.http.get<Page<Spool>>(this.url, { params: toPageParams(request, { search, status }) });
  }

  get(id: number): Observable<Spool> {
    return this.http.get<Spool>(`${this.url}/${id}`);
  }

  create(isoId: number, spoolNo: string): Observable<Spool> {
    return this.http.post<Spool>(`${API_BASE}/isos/${isoId}/spools`, { spoolNo });
  }

  update(id: number, spoolNo: string): Observable<Spool> {
    return this.http.put<Spool>(`${this.url}/${id}`, { spoolNo });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  materials(spoolId: number): Observable<SpoolMaterial[]> {
    return this.http.get<SpoolMaterial[]>(`${this.url}/${spoolId}/materials`);
  }

  addMaterial(spoolId: number, materialId: number, qtyRequired: number): Observable<SpoolMaterial> {
    return this.http.post<SpoolMaterial>(`${this.url}/${spoolId}/materials`, { materialId, qtyRequired });
  }

  updateMaterialQuantity(spoolId: number, id: number, qtyRequired: number): Observable<SpoolMaterial> {
    return this.http.put<SpoolMaterial>(`${this.url}/${spoolId}/materials/${id}`, { qtyRequired });
  }

  removeMaterial(spoolId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${spoolId}/materials/${id}`);
  }
}
