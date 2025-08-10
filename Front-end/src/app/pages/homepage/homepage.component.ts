import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PropertyService, Property } from '../../services/property.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit, OnDestroy {
  stats = { properties: 0, users: 0, avgTime: 2 };
  mockCards = Array.from({ length: 5 });
  private sub?: Subscription;

  constructor(
    private propertyService: PropertyService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.sub = this.propertyService.getAll().subscribe({
      next: (props: Property[]) => {
        const published = props.filter(p => this.isPublished(p.status));
        this.stats.properties = published.length;
        // Placeholder for users; would come from a user endpoint
        this.stats.users = new Set(props.map(p => p.userId)).size;
      },
      error: () => {}
    });
  }

  private isPublished(status: string | number): boolean {
    if (typeof status === 'number') return status === 1; // assuming enum mapping
    return status === 'PUBLISHED';
  }

  getDepositLink(): string {
    return this.auth.isLoggedIn() ? '/dashboard' : '/account';
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
