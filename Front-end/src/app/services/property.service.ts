import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { NotificationService } from './notification.service';
import { ConfirmationService } from './confirmation.service';

export interface AddressPayload {
  street: string;
  city: string;
  zipCode: string;
}

export interface CreatePropertyPayload {
  title: string;
  description: string;
  type: string;
  price: number;
  surface: number;
  address: AddressPayload;
}

export interface UpdatePropertyPayload extends Partial<CreatePropertyPayload> {
  surface?: number;
}

export interface Property extends CreatePropertyPayload {
  id: string;
  userId: string; // present in backend response for ownership
  status: string | number;
  createdAt: string;
  publishedAt?: string | null;
  images?: { id: string; url: string; order: number }[];
  user?: { email: string }; // Email de l'annonceur
}

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private apiUrl = 'http://localhost:5172/api/Properties';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private confirmationService: ConfirmationService
  ) {}

  create(payload: CreatePropertyPayload): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, payload).pipe(
      tap(property => {
        this.notificationService.success('Propriété créée avec succès !');
      }),
      catchError(error => {
        this.notificationService.error('Erreur lors de la création de la propriété.');
        return throwError(error);
      })
    );
  }

  getAll(): Observable<Property[]> {
    return this.http.get<Property[]>(this.apiUrl);
  }

  update(id: string, payload: UpdatePropertyPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload).pipe(
      tap(() => {
        this.notificationService.success('Propriété mise à jour avec succès !');
      }),
      catchError(error => {
        this.notificationService.error('Erreur lors de la mise à jour de la propriété.');
        return throwError(error);
      })
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.notificationService.success('Propriété supprimée avec succès !');
      }),
      catchError(error => {
        this.notificationService.error('Erreur lors de la suppression de la propriété.');
        return throwError(error);
      })
    );
  }

  publish(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/publish`, {}).pipe(
      tap(() => {
        this.notificationService.success('Propriété publiée avec succès !');
      }),
      catchError(error => {
        this.notificationService.error('Erreur lors de la publication de la propriété.');
        return throwError(error);
      })
    );
  }

  archive(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/archive`, {}).pipe(
      tap(() => {
        this.notificationService.success('Propriété archivée avec succès !');
      }),
      catchError(error => {
        this.notificationService.error('Erreur lors de l\'archivage de la propriété.');
        return throwError(error);
      })
    );
  }

  draft(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/draft`, {}).pipe(
      tap(() => {
        this.notificationService.success('Propriété remise en brouillon avec succès !');
      }),
      catchError(error => {
        this.notificationService.error('Erreur lors de la remise en brouillon.');
        return throwError(error);
      })
    );
  }

  uploadImageSimple(propertyId: string, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${propertyId}/image-simple`, formData, { responseType: 'text' }).pipe(
      tap(() => {
        this.notificationService.success('Image téléchargée avec succès !');
      }),
      catchError(error => {
        this.notificationService.error('Erreur lors du téléchargement de l\'image.');
        return throwError(error);
      })
    );
  }

  uploadImages(propertyId: string, files: File[]): Observable<{ id: string; url: string; order: number }[]> {
    const formData = new FormData();
    for (const f of files) {
      formData.append('files', f);
    }
    return this.http.post<{ id: string; url: string; order: number }[]>(`${this.apiUrl}/${propertyId}/images`, formData).pipe(
      tap((images) => {
        this.notificationService.success(`${images.length} image(s) téléchargée(s) avec succès !`);
      }),
      catchError(error => {
        this.notificationService.error('Erreur lors du téléchargement des images.');
        return throwError(error);
      })
    );
  }

  deleteImage(propertyId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${propertyId}/images/${imageId}`).pipe(
      tap(() => {
        this.notificationService.success('Image supprimée avec succès !');
      }),
      catchError(error => {
        this.notificationService.error('Erreur lors de la suppression de l\'image.');
        return throwError(error);
      })
    );
  }

  reorderImages(propertyId: string, imageIds: string[]): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${propertyId}/images/reorder`, { imageIds }).pipe(
      tap(() => {
        this.notificationService.success('Ordre des images mis à jour !');
      }),
      catchError(error => {
        this.notificationService.error('Erreur lors de la réorganisation des images.');
        return throwError(error);
      })
    );
  }

  // Methods with confirmation dialogs for destructive actions
  async deleteWithConfirmation(id: string, propertyTitle: string): Promise<Observable<void> | null> {
    const shouldDelete = await this.confirmationService.confirmDelete(propertyTitle);
    if (!shouldDelete) {
      return null;
    }
    return this.delete(id);
  }

  async publishWithConfirmation(id: string, propertyTitle: string): Promise<Observable<void> | null> {
    const shouldPublish = await this.confirmationService.confirmPublish(propertyTitle);
    if (!shouldPublish) {
      return null;
    }
    return this.publish(id);
  }

  async archiveWithConfirmation(id: string, propertyTitle: string): Promise<Observable<void> | null> {
    const shouldArchive = await this.confirmationService.confirmArchive(propertyTitle);
    if (!shouldArchive) {
      return null;
    }
    return this.archive(id);
  }

  async deleteImageWithConfirmation(propertyId: string, imageId: string): Promise<Observable<void> | null> {
    const shouldDelete = await this.confirmationService.confirmDelete('cette image');
    if (!shouldDelete) {
      return null;
    }
    return this.deleteImage(propertyId, imageId);
  }

  getUserEmail(userId: string): Observable<string> {
    return this.http.get(`http://localhost:5172/api/Users/${userId}/email`, { responseType: 'text' });
  }
}
