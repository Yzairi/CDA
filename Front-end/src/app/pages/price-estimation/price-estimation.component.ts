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
  activeTab: 'estimation' | 'enhancement' = 'estimation';
  
  estimationRequest: EstimationRequest = {
    description: '',
    isForSale: true // true = vente, false = location
  };

  // Pour l'amélioration de description
  originalDescription = '';
  enhancedDescription = '';

  estimationResult: EstimationResponse | null = null;
  isLoading = false;
  isEnhancing = false;
  error: string | null = null;

  constructor(private priceEstimationService: PriceEstimationService) {}

  switchTab(tab: 'estimation' | 'enhancement') {
    this.activeTab = tab;
    this.error = null;
  }

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

  enhanceDescription() {
    if (!this.originalDescription.trim()) {
      this.error = 'Veuillez saisir une description à améliorer';
      return;
    }

    this.isEnhancing = true;
    this.error = null;

    this.priceEstimationService.enhanceDescription({ 
      description: this.originalDescription 
    }).subscribe({
      next: (response) => {
        this.enhancedDescription = response.enhancedDescription;
        this.isEnhancing = false;
      },
      error: (err) => {
        console.error('Erreur amélioration description:', err);
        this.error = 'Erreur lors de l\'amélioration de la description';
        this.isEnhancing = false;
      }
    });
  }

  copyEnhancedDescription() {
    if (this.enhancedDescription) {
      navigator.clipboard.writeText(this.enhancedDescription);
    }
  }

  reset() {
    this.estimationRequest = {
      description: '',
      isForSale: true
    };
    this.originalDescription = '';
    this.enhancedDescription = '';
    this.estimationResult = null;
    this.error = null;
  }
}
