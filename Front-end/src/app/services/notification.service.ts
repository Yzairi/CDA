import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  
  get notifications() {
    return this.notifications$.asObservable();
  }

  show(notification: Omit<Notification, 'id'>): string {
    const id = this.generateId();
    const newNotification: Notification = {
      id,
      duration: 5000,
      ...notification
    };

    const current = this.notifications$.value;
    this.notifications$.next([...current, newNotification]);

    // Auto-remove si pas persistent
    if (!newNotification.persistent && newNotification.duration) {
      setTimeout(() => this.remove(id), newNotification.duration);
    }

    return id;
  }

  success(message: string, title?: string): string {
    return this.show({ type: 'success', message, title });
  }

  error(message: string, title?: string): string {
    return this.show({ type: 'error', message, title, duration: 8000 });
  }

  warning(message: string, title?: string): string {
    return this.show({ type: 'warning', message, title, duration: 6000 });
  }

  info(message: string, title?: string): string {
    return this.show({ type: 'info', message, title });
  }

  remove(id: string): void {
    const current = this.notifications$.value;
    this.notifications$.next(current.filter(n => n.id !== id));
  }

  clear(): void {
    this.notifications$.next([]);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
