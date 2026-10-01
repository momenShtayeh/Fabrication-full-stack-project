import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE, Page, PageRequest, toPageParams } from '../../core/http/api';

export interface Material {
  id: number;
  code: string;
  description: string;
  quantity: number;
}

export interface MaterialRequest {
  code: string;
  description: string;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class MaterialService {

  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/materials`;

  list(search: string, request: PageRequest): Observable<Page<Material>> {
    return this.http.get<Page<Material>>(this.url, { params: toPageParams(request, { search }) });
  }

  create(material: MaterialRequest): Observable<Material> {
    return this.http.post<Material>(this.url, material);
  }

  update(id: number, material: MaterialRequest): Observable<Material> {
    return this.http.put<Material>(`${this.url}/${id}`, material);
  }

  receiveStock(id: number, quantity: number): Observable<Material> {
    return this.http.post<Material>(`${this.url}/${id}/receive`, { quantity });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
