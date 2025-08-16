import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EstimationRequest {
  description: string;
  isForSale: boolean; // true = vente, false = location
}

export interface EstimationResponse {
  estimatedPrice: number;
  minPrice: number;
  maxPrice: number;
  explanation: string;
}

@Injectable({
  providedIn: 'root'
})
export class PriceEstimationService {
  private apiUrl = 'http://localhost:5172/api/priceestimation';

  constructor(private http: HttpClient) {}

  estimatePrice(request: EstimationRequest): Observable<EstimationResponse> {
    return this.http.post<EstimationResponse>(`${this.apiUrl}/estimate`, request);
  }
}
