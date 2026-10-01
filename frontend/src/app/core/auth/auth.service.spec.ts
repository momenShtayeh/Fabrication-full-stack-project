import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE } from '../http/api';
import { AuthService } from './auth.service';

//HttpTestingController stands in for the backend: the test decides what each request answers
describe('AuthService', () => {
  let service: AuthService;
  let backend: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });
    service = TestBed.inject(AuthService);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    backend.verify();
    sessionStorage.clear();
  });

  it('sends the credentials as basic auth and keeps the user once the backend accepts them', () => {
    service.login('planner', 'secret').subscribe();

    const request = backend.expectOne(`${API_BASE}/auth/me`);
    expect(request.request.headers.get('Authorization')).toBe(`Basic ${btoa('planner:secret')}`);
    request.flush({ username: 'planner', roles: ['PLANNER'] });

    expect(service.isLoggedIn()).toBeTrue();
    expect(service.canEdit()).toBeTrue();
    expect(service.authorizationHeader()).toBe(`Basic ${btoa('planner:secret')}`);
  });

  it('only lets planners edit', () => {
    service.login('viewer', 'secret').subscribe();
    backend.expectOne(`${API_BASE}/auth/me`).flush({ username: 'viewer', roles: ['VIEWER'] });

    expect(service.isLoggedIn()).toBeTrue();
    expect(service.canEdit()).toBeFalse();
  });

  it('keeps nothing when the credentials are wrong', () => {
    service.login('planner', 'wrong').subscribe({ error: () => undefined });
    backend.expectOne(`${API_BASE}/auth/me`).flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(service.isLoggedIn()).toBeFalse();
    expect(service.authorizationHeader()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });

  it('forgets the user on logout', () => {
    service.login('planner', 'secret').subscribe();
    backend.expectOne(`${API_BASE}/auth/me`).flush({ username: 'planner', roles: ['PLANNER'] });

    service.logout();

    expect(service.isLoggedIn()).toBeFalse();
    expect(sessionStorage.length).toBe(0);
  });
});
