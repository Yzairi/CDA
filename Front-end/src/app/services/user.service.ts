import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RawUser {
  id: string;
  email: string;
  role: string; // "ADMIN" | "ADVERTISER"
  status: string; // "ACTIVE" etc.
  // passwordHash and other fields may come but we ignore them
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = 'http://localhost:5172/api/Users';
  constructor(private http: HttpClient) {}

  getAll(): Observable<RawUser[]> { return this.http.get<RawUser[]>(this.apiUrl); }

  updateRoleStatus(id: string, isAdmin: boolean, status: string) {
    return this.http.put(`${this.apiUrl}/${id}`, { isAdmin, status });
  }

  delete(id: string) { return this.http.delete(`${this.apiUrl}/${id}`); }
}
