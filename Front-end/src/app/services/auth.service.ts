import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

interface User {
  id: string;
  email: string;
  role: number | string;
  status: string;
  createdAt: string;
}

interface LoginResponse {
  id: string;
  email: string;
  role: number | string;
  status: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5172/api';
  public currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object,
    private router: Router
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
  }

  register(email: string, password: string, isAdmin: boolean = false): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/Users/register`, { email, password, isAdmin }).pipe(
      tap(res => {
        const user: User = { ...res };
        if (this.isBrowser) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
      })
    );
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/Users/login`, { email, password }).pipe(
      tap(res => {
        const user: User = { ...res };
        if (this.isBrowser) {
          localStorage.setItem('currentUser', JSON.stringify(user));
        }
        this.currentUserSubject.next(user);
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
    this.currentUserSubject.next(null);
    try {
      const currentUrl = this.router.url;
      if (currentUrl.startsWith('/dashboard') || currentUrl.startsWith('/backoffice')) {
        this.router.navigate(['/']);
      }
    } catch {}
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    const role = user.role;
    if (typeof role === 'number') {
      return role === 1;
    }
    return role.toString().toUpperCase() === 'ADMIN';
  }

  getRoleLabel(): string | null {
    const user = this.currentUserSubject.value;
    if (!user) return null;
    const role = user.role;
    if (typeof role === 'number') {
      return role === 1 ? 'ADMIN' : 'ADVERTISER';
    }
    return role.toString();
  }

}
