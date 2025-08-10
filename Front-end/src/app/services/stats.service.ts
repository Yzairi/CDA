import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface StatsSummary {
  totalUsers: number;
  activeUsers: number;
  totalProperties: number;
  draftProperties: number;
  publishedProperties: number;
  archivedProperties: number;
  averagePublishDelayMinutes: number | null;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private apiUrl = 'http://localhost:5172/api/Stats';
  constructor(private http: HttpClient) {}
  getSummary(): Observable<StatsSummary> { return this.http.get<StatsSummary>(`${this.apiUrl}/summary`); }
}
