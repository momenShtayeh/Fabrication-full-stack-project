import { HttpClient, HttpHeaders, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE } from '../http/api';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let authorization: string | null;

  beforeEach(() => {
    authorization = 'Basic stored-token';
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        //a fake AuthService, so the test controls whether someone is logged in
        { provide: AuthService, useValue: { authorizationHeader: () => authorization } }
      ]
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('adds the stored credentials and the no-popup header to api requests', () => {
    http.get(`${API_BASE}/materials`).subscribe();

    const headers = backend.expectOne(`${API_BASE}/materials`).request.headers;
    expect(headers.get('Authorization')).toBe('Basic stored-token');
    expect(headers.get('X-Requested-With')).toBe('XMLHttpRequest');
  });

  it('sends no credentials when nobody is logged in', () => {
    authorization = null;
    http.get(`${API_BASE}/materials`).subscribe();

    expect(backend.expectOne(`${API_BASE}/materials`).request.headers.has('Authorization')).toBeFalse();
  });

  it('keeps credentials set by the caller, as the login request does', () => {
    http.get(`${API_BASE}/auth/me`, { headers: new HttpHeaders({ Authorization: 'Basic typed-in' }) }).subscribe();

    expect(backend.expectOne(`${API_BASE}/auth/me`).request.headers.get('Authorization')).toBe('Basic typed-in');
  });

  it('never sends credentials to other servers', () => {
    http.get('https://example.com/data').subscribe();

    const headers = backend.expectOne('https://example.com/data').request.headers;
    expect(headers.has('Authorization')).toBeFalse();
    expect(headers.has('X-Requested-With')).toBeFalse();
  });
});
