import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('[ERROR] HTTP Error:', error);

        if (error.status === 401) {
          // Token expiré ou invalide
          this.notificationService.warning('Votre session a expiré. Veuillez vous reconnecter.');
          this.authService.logout();
          this.router.navigate(['/account']);
        } else if (error.status === 403) {
          // Accès interdit
          this.notificationService.error('Accès interdit. Vous n\'avez pas les permissions nécessaires.');
        } else if (error.status === 404) {
          // Ressource non trouvée
          this.notificationService.error('Ressource non trouvée.');
        } else if (error.status === 400) {
          // Erreur de validation
          const message = this.extractErrorMessage(error);
          this.notificationService.error(message || 'Données invalides. Vérifiez votre saisie.');
        } else if (error.status === 500) {
          // Erreur serveur
          this.notificationService.error('Erreur serveur. Veuillez réessayer plus tard.');
        } else if (error.status === 0) {
          // Pas de connexion réseau
          this.notificationService.error('Problème de connexion. Vérifiez votre réseau.');
        } else {
          // Autres erreurs
          const message = this.extractErrorMessage(error);
          this.notificationService.error(message || `Erreur ${error.status}: ${error.message}`);
        }

        return throwError(() => error);
      })
    );
  }

  private extractErrorMessage(error: HttpErrorResponse): string | null {
    if (error.error?.message) {
      return error.error.message;
    }
    if (error.error?.title) {
      return error.error.title;
    }
    if (typeof error.error === 'string') {
      return error.error;
    }
    return null;
  }
}
