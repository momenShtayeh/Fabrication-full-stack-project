import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE, Page, PageRequest, toPageParams } from '../../core/http/api';

export type IsoStatus = 'UNVERIFIED' | 'UNDER_VERIFICATION' | 'VERIFIED';

export const ISO_STATUSES: { value: IsoStatus; label: string }[] = [
  { value: 'UNVERIFIED', label: 'Unverified' },
  { value: 'UNDER_VERIFICATION', label: 'Under verification' },
  { value: 'VERIFIED', label: 'Verified' }
];

export interface Iso {
  id: number;
  isoNo: string;
  revision: string;
  status: IsoStatus;
}

export interface IsoRequest {
  isoNo: string;
  revision: string;
  status: IsoStatus;
}

@Injectable({ providedIn: 'root' })
export class IsoService {

  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/isos`;

  list(search: string, request: PageRequest): Observable<Page<Iso>> {
    return this.http.get<Page<Iso>>(this.url, { params: toPageParams(request, { search }) });
  }

  get(id: number): Observable<Iso> {
    return this.http.get<Iso>(`${this.url}/${id}`);
  }

  create(iso: IsoRequest): Observable<Iso> {
    return this.http.post<Iso>(this.url, iso);
  }

  update(id: number, iso: IsoRequest): Observable<Iso> {
    return this.http.put<Iso>(`${this.url}/${id}`, iso);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
