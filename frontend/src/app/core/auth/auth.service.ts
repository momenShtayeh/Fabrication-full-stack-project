import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';

import { API_BASE } from '../http/api';

export interface CurrentUser {
  username: string;
  roles: string[];
}

interface Session {
  token: string;
  user: CurrentUser;
}

const STORAGE_KEY = 'fabrication.session';

/*
 * Basic authentication: the backend has no login session, so the encoded credentials are kept
 * for this browser tab (sessionStorage) and sent with every request by the auth interceptor.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly http = inject(HttpClient);
  private readonly session = signal<Session | null>(this.restoreSession());

  readonly user = computed(() => this.session()?.user ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);
  readonly canEdit = computed(() => this.user()?.roles.includes('PLANNER') ?? false);

  //checks the credentials by asking the backend who they belong to, and keeps them only if that succeeds
  login(username: string, password: string): Observable<CurrentUser> {
    const token = btoa(`${username}:${password}`);
    const headers = new HttpHeaders({ Authorization: `Basic ${token}` });

    return this.http.get<CurrentUser>(`${API_BASE}/auth/me`, { headers }).pipe(
      tap(user => this.saveSession({ token, user }))
    );
  }

  logout(): void {
    this.session.set(null);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  authorizationHeader(): string | null {
    const token = this.session()?.token;
    return token ? `Basic ${token}` : null;
  }

  private saveSession(session: Session): void {
    this.session.set(session);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  private restoreSession(): Session | null {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) as Session : null;
    } catch {
      return null;
    }
  }
}
