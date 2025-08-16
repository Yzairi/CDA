import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PriceEstimationService, EstimationRequest, EstimationResponse } from '../../services/price-estimation.service';

@Component({
  selector: 'app-price-estimation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './price-estimation.component.html',
  styleUrl: './price-estimation.component.css'
})
export class PriceEstimationComponent {
  estimationRequest: EstimationRequest = {
    description: '',
    isForSale: true // true = vente, false = location
  };

  estimationResult: EstimationResponse | null = null;
  isLoading = false;
  error: string | null = null;

  constructor(private priceEstimationService: PriceEstimationService) {}

  onSubmit() {
    if (!this.isFormValid()) {
      this.error = 'Veuillez décrire le bien immobilier (minimum 10 caractères)';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.estimationResult = null;

    this.priceEstimationService.estimatePrice(this.estimationRequest).subscribe({
      next: (result: EstimationResponse) => {
        this.estimationResult = result;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.error = 'Erreur lors de l\'estimation. Veuillez réessayer.';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  private isFormValid(): boolean {
    return this.estimationRequest.description.trim().length > 10;
  }

  reset() {
    this.estimationRequest = {
      description: '',
      isForSale: true
    };
    this.estimationResult = null;
    this.error = null;
  }
}
