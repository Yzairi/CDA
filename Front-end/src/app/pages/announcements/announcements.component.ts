import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PropertyService, Property } from '../../services/property.service';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule, PropertyCardComponent],
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css']
})
export class AnnouncementsComponent implements OnInit {
  properties: Property[] = [];
  filteredProperties: Property[] = [];
  loading = false;
  error: string | null = null;

  // Filtres
  searchQuery = '';
  selectedType = '';
  selectedCity = '';
  priceMin = '';
  priceMax = '';
  
  // Options pour les filtres
  propertyTypes: string[] = [];
  cities: string[] = [];

  constructor(private propertyService: PropertyService) {}

  ngOnInit(): void {
    this.fetch();
  }

  fetch(): void {
    this.loading = true;
    this.error = null;
    this.propertyService.getAll().subscribe({
      next: (data) => {
        this.properties = data.filter(p => {
          const s: any = p.status;
          const statusText = (s === 1 ? 'PUBLISHED' : s === 0 ? 'DRAFT' : s === 2 ? 'ARCHIVED' : s).toString();
          return statusText === 'PUBLISHED';
        });
        
        // Extraire les villes uniques
        this.cities = [...new Set(this.properties.map(p => p.address?.city).filter(city => city))];
        
        // Extraire les types uniques
        this.propertyTypes = [...new Set(this.properties.map(p => p.type).filter(type => type))];
        
        this.filteredProperties = [...this.properties];
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error || 'Erreur lors du chargement';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredProperties = this.properties.filter(property => {
      // Filtre par recherche (titre + description)
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const matchesTitle = property.title?.toLowerCase().includes(query);
        const matchesDescription = property.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Filtre par type
      if (this.selectedType && this.selectedType.trim() !== '') {
        if (property.type !== this.selectedType) {
          return false;
        }
      }

      // Filtre par ville
      if (this.selectedCity && property.address?.city !== this.selectedCity) {
        return false;
      }

      // Filtre par prix
      const price = property.price || 0;
      if (this.priceMin && price < parseFloat(this.priceMin)) {
        return false;
      }
      if (this.priceMax && price > parseFloat(this.priceMax)) {
        return false;
      }

      return true;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedType = '';
    this.selectedCity = '';
    this.priceMin = '';
    this.priceMax = '';
    this.filteredProperties = [...this.properties];
  }
}
