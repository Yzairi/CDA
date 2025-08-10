import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  menuOpen = false;

  constructor(public auth: AuthService) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenuOnNavigate(evt: Event) {
    const target = evt.target as HTMLElement;
    if (target.closest('a')) {
      this.menuOpen = false;
    }
  }
}
