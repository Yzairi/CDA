import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmationData {
  id: string;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export interface ConfirmationResult {
  id: string;
  confirmed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {
  private confirmationsSubject = new BehaviorSubject<ConfirmationData[]>([]);
  private resultsSubject = new BehaviorSubject<ConfirmationResult | null>(null);

  confirmations$ = this.confirmationsSubject.asObservable();
  results$ = this.resultsSubject.asObservable();

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  confirm(
    title: string,
    message: string,
    options?: {
      confirmText?: string;
      cancelText?: string;
      type?: 'danger' | 'warning' | 'info';
    }
  ): Promise<boolean> {
    const id = this.generateId();
    const confirmationData: ConfirmationData = {
      id,
      title,
      message,
      confirmText: options?.confirmText || 'Confirmer',
      cancelText: options?.cancelText || 'Annuler',
      type: options?.type || 'info'
    };

    const currentConfirmations = this.confirmationsSubject.value;
    this.confirmationsSubject.next([...currentConfirmations, confirmationData]);

    return new Promise((resolve) => {
      const subscription = this.results$.subscribe(result => {
        if (result && result.id === id) {
          subscription.unsubscribe();
          resolve(result.confirmed);
        }
      });
    });
  }

  respond(id: string, confirmed: boolean): void {
    // Remove the confirmation from the list
    const currentConfirmations = this.confirmationsSubject.value;
    const updatedConfirmations = currentConfirmations.filter(c => c.id !== id);
    this.confirmationsSubject.next(updatedConfirmations);

    // Send the result
    this.resultsSubject.next({ id, confirmed });
  }

  // Helper methods for specific types of confirmations
  confirmDelete(itemName: string): Promise<boolean> {
    return this.confirm(
      'Confirmer la suppression',
      `Êtes-vous sûr de vouloir supprimer "${itemName}" ? Cette action est irréversible.`,
      {
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger'
      }
    );
  }

  confirmLogout(): Promise<boolean> {
    return this.confirm(
      'Confirmer la déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      {
        confirmText: 'Se déconnecter',
        cancelText: 'Rester connecté',
        type: 'warning'
      }
    );
  }

  confirmPublish(itemName: string): Promise<boolean> {
    return this.confirm(
      'Confirmer la publication',
      `Êtes-vous sûr de vouloir publier "${itemName}" ?`,
      {
        confirmText: 'Publier',
        cancelText: 'Annuler',
        type: 'info'
      }
    );
  }

  confirmArchive(itemName: string): Promise<boolean> {
    return this.confirm(
      'Confirmer l\'archivage',
      `Êtes-vous sûr de vouloir archiver "${itemName}" ?`,
      {
        confirmText: 'Archiver',
        cancelText: 'Annuler',
        type: 'warning'
      }
    );
  }

  // Admin-specific confirmations
  confirmUserRoleChange(userEmail: string, newRole: string): Promise<boolean> {
    const action = newRole === 'ADMIN' ? 'promouvoir en administrateur' : 'rétrograder comme annonceur';
    return this.confirm(
      'Modifier le rôle utilisateur',
      `Êtes-vous sûr de vouloir ${action} "${userEmail}" ?`,
      {
        confirmText: newRole === 'ADMIN' ? 'Promouvoir' : 'Rétrograder',
        cancelText: 'Annuler',
        type: 'warning'
      }
    );
  }

  confirmUserDeletion(userEmail: string, propertyCount: number): Promise<boolean> {
    return this.confirm(
      'Supprimer l\'utilisateur',
      `Êtes-vous sûr de vouloir supprimer définitivement l'utilisateur "${userEmail}" ? Cette action supprimera également toutes ses annonces (${propertyCount}).`,
      {
        confirmText: 'Supprimer définitivement',
        cancelText: 'Annuler',
        type: 'danger'
      }
    );
  }

  confirmPropertyStatusChange(propertyTitle: string, newStatus: string): Promise<boolean> {
    let message = '';
    let confirmText = '';
    let type: 'danger' | 'warning' | 'info' = 'info';

    switch (newStatus.toLowerCase()) {
      case 'draft':
        message = `Êtes-vous sûr de vouloir remettre "${propertyTitle}" en brouillon ?`;
        confirmText = 'Remettre en brouillon';
        type = 'warning';
        break;
      case 'published':
        message = `Êtes-vous sûr de vouloir publier "${propertyTitle}" ?`;
        confirmText = 'Publier';
        type = 'info';
        break;
      case 'archived':
        message = `Êtes-vous sûr de vouloir archiver "${propertyTitle}" ?`;
        confirmText = 'Archiver';
        type = 'warning';
        break;
      default:
        message = `Êtes-vous sûr de vouloir modifier le statut de "${propertyTitle}" ?`;
        confirmText = 'Confirmer';
        type = 'info';
    }

    return this.confirm(
      'Modifier le statut de la propriété',
      message,
      { confirmText, cancelText: 'Annuler', type }
    );
  }
}
