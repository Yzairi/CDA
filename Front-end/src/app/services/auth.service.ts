import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { ConfirmationService } from './confirmation.service';

interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  token: string;
}

interface AuthResponse {
  id: string;
  email: string;
  isAdmin: boolean;
  token: string;
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
    private router: Router,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    if (this.isBrowser) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
  }

  register(email: string, password: string, isAdmin: boolean = false): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Users/register`, { email, password, isAdmin }).pipe(
      tap(res => this.persistAuth(res))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/Users/login`, { email, password }).pipe(
      tap(res => {
        this.persistAuth(res);
        this.notificationService.success('Connexion réussie ! Bienvenue.');
      }),
      catchError(error => {
        this.notificationService.error('Échec de la connexion. Vérifiez vos identifiants.');
        return throwError(error);
      })
    );
  }

  private persistAuth(res: AuthResponse) {
    const user: User = { id: res.id, email: res.email, isAdmin: res.isAdmin, token: res.token };
    if (this.isBrowser) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('access_token', res.token);
    }
    this.currentUserSubject.next(user);
  }

  async logout(): Promise<void> {
    const shouldLogout = await this.confirmationService.confirmLogout();
    if (!shouldLogout) {
      return;
    }

    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('access_token');
    }
    this.currentUserSubject.next(null);
    this.notificationService.info('Vous avez été déconnecté avec succès.');
    try {
      const currentUrl = this.router.url;
  if (currentUrl.startsWith('/dashboard') || currentUrl.startsWith('/backoffice') || currentUrl.startsWith('/admin')) {
        this.router.navigate(['/']);
      }
    } catch {}
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  isAdmin(): boolean {
  const user = this.currentUserSubject.value;
  return !!user?.isAdmin;
  }

  getRoleLabel(): string | null {
  const user = this.currentUserSubject.value;
  if (!user) return null;
  return user.isAdmin ? 'ADMIN' : 'ADVERTISER';
  }

}
