import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../../services/property.service';

@Component({
  selector: 'app-property-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-card.component.html',
  styleUrls: ['./property-card.component.css']
})
export class PropertyCardComponent {
  @Input() property!: Property;
  @Input() showStatus: boolean = true;

  get priceFormatted(): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(this.property.price);
  }

  get surfaceLabel(): string {
    return this.property.surface ? this.property.surface + ' m²' : '—';
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
