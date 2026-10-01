import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { API_BASE } from './api';
import { errorInterceptor } from './error.interceptor';
import { NotificationService } from './notification.service';

//jasmine spies replace the real services and record how they were called
describe('errorInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let notification: jasmine.SpyObj<NotificationService>;
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    notification = jasmine.createSpyObj<NotificationService>('NotificationService', ['error', 'success']);
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['logout']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: notification },
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router }
      ]
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  function failRequest(url: string, status: number, body: object | null): void {
    http.get(url).subscribe({ error: () => undefined });
    backend.expectOne(url).flush(body, { status, statusText: 'Error' });
  }

  it('shows the message the backend sent', () => {
    failRequest(`${API_BASE}/materials`, 409, { detail: "Material with code 'PIPE' already exists" });

    expect(notification.error).toHaveBeenCalledWith("Material with code 'PIPE' already exists");
  });

  it('lists every invalid field of a validation error', () => {
    failRequest(`${API_BASE}/materials`, 400, {
      detail: 'Validation failed',
      errors: { code: 'must not be blank', quantity: 'must be greater than or equal to 0' }
    });

    expect(notification.error).toHaveBeenCalledWith(
      'code must not be blank, quantity must be greater than or equal to 0');
  });

  it('logs out and opens the login page when the credentials stop working', () => {
    failRequest(`${API_BASE}/materials`, 401, null);

    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('leaves a wrong password on the login form to the login page', () => {
    failRequest(`${API_BASE}/auth/me`, 401, null);

    expect(notification.error).not.toHaveBeenCalled();
    expect(auth.logout).not.toHaveBeenCalled();
  });

  it('explains a missing permission', () => {
    failRequest(`${API_BASE}/materials`, 403, { message: 'Forbidden' });

    expect(notification.error).toHaveBeenCalledWith('You do not have permission to do this');
  });
});
