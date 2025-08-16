import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property, PropertyService } from '../../services/property.service';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-card.component.html',
  styleUrls: ['./property-card.component.css']
})
export class PropertyCardComponent implements OnInit {
  @Input() property!: Property;
  @Input() showStatus: boolean = true;
  
  userEmail: string | null = null;
  
  // Gestion du carousel d'images
  currentImageIndex: number = 0;

  constructor(private propertyService: PropertyService) {}

  ngOnInit() {
    if (this.property.userId) {
      this.propertyService.getUserEmail(this.property.userId).subscribe({
        next: (email) => {
          this.userEmail = email;
        },
        error: (error) => {
          console.error('Erreur lors du chargement de l\'email:', error);
          this.userEmail = 'Email non disponible';
        }
      });
    }
  }

  get priceFormatted(): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(this.property.price);
  }

  get surfaceLabel(): string {
    return this.property.surface ? this.property.surface + ' m²' : '—';
  }

  // Méthode pour changer l'image actuelle
  setCurrentImage(index: number): void {
    this.currentImageIndex = index;
  }

  private statusMap: Record<string | number, string> = {
    0: 'DRAFT',
    1: 'PUBLISHED',
    2: 'ARCHIVED',
    'DRAFT': 'DRAFT',
    'PUBLISHED': 'PUBLISHED',
    'ARCHIVED': 'ARCHIVED'
  };

  displayStatus(value: string | number): string {
    return this.statusMap[value] || value.toString();
  }

  statusClass(value: string | number): string {
    return this.displayStatus(value).toLowerCase();
  }
}
