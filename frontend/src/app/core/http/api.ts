import { HttpParams } from '@angular/common/http';

//matches ApiPaths.BASE in the backend, requests go through the dev server proxy (proxy.conf.json)
export const API_BASE = '/api/v1/fabrication';

//the json shape of every paginated list returned by the backend (PageResponse)
export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface PageRequest {
  page: number;
  size: number;
  sort: { active: string; direction: 'asc' | 'desc' | '' };
}

//error body returned by the backend (RFC 9457 problem details)
export interface ProblemDetail {
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string>;
}

export function toPageParams(request: PageRequest, filters: Record<string, string | null | undefined> = {}): HttpParams {
  let params = new HttpParams()
    .set('page', request.page)
    .set('size', request.size);
  if (request.sort.direction) {
    params = params.set('sort', `${request.sort.active},${request.sort.direction}`);
  }
  for (const [name, value] of Object.entries(filters)) {
    if (value) {
      params = params.set(name, value);
    }
  }
  return params;
}
