import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyService, Property } from '../../services/property.service';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, PropertyCardComponent],
  templateUrl: './announcements.component.html',
  styleUrls: ['./announcements.component.css']
})
export class AnnouncementsComponent implements OnInit {
  properties: Property[] = [];
  loading = false;
  error: string | null = null;

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
        this.loading = false;
      },
      error: (err) => {
        this.error = err.error || 'Erreur lors du chargement';
        this.loading = false;
      }
    });
  }
}
