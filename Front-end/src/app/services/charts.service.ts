import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TimelinePoint { date: string; count: number; }
export interface TimelineResponse { users: TimelinePoint[]; properties: TimelinePoint[]; publishedProperties: TimelinePoint[]; }

@Injectable({ providedIn: 'root' })
export class ChartsService {
  private apiUrl = 'http://localhost:5172/api/Stats';
  constructor(private http: HttpClient) {}
  getTimeline(): Observable<TimelineResponse> { return this.http.get<TimelineResponse>(`${this.apiUrl}/timeline`); }
}
