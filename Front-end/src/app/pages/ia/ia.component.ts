import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IAService, EstimationRequest, EstimationResponse, DescriptionResponse } from '../../services/ia.service';

@Component({
  selector: 'app-ia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ia.component.html',
  styleUrl: './ia.component.css'
})
export class IAComponent {
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

  constructor(private iaService: IAService) {}

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

    this.iaService.estimatePrice(this.estimationRequest).subscribe({
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

    this.iaService.enhanceDescription({ 
      description: this.originalDescription 
    }).subscribe({
      next: (response: DescriptionResponse) => {
        this.enhancedDescription = response.enhancedDescription;
        this.isEnhancing = false;
      },
      error: (err: any) => {
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
