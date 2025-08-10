import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  userId: string;
}

export interface UpdatePropertyPayload extends Partial<CreatePropertyPayload> {
  surface?: number;
}

export interface Property extends CreatePropertyPayload {
  id: string;
  status: string | number;
  createdAt: string;
  publishedAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private apiUrl = 'http://localhost:5172/api/Properties';

  constructor(private http: HttpClient) {}

  create(payload: CreatePropertyPayload): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, payload);
  }

  getAll(): Observable<Property[]> {
    return this.http.get<Property[]>(this.apiUrl);
  }

  update(id: string, payload: UpdatePropertyPayload): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, payload);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  publish(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/publish`, {});
  }

  archive(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/archive`, {});
  }

  draft(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/draft`, {});
  }
}
