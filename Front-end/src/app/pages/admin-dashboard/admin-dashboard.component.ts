import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserService, RawUser } from '../../services/user.service';
import { PropertyService, Property } from '../../services/property.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  activeTab: 'stats' | 'annonces' | 'users' = 'stats';
  users: UserRow[] = [];
  loadingUsers = false;
  userError = '';
  savingUserIds = new Set<string>();
  // properties (annonces) admin view
  properties: Property[] = [];
  loadingProperties = false;
  propertyError = '';
  savingPropIds = new Set<string>();
  private authSub?: Subscription;

  constructor(private userService: UserService,
              private propertyService: PropertyService,
              private auth: AuthService,
              private router: Router) {}

  ngOnInit(): void {
    // redirect immediately if not admin (in case of manual navigation)
    const u = this.auth.currentUserSubject.value;
    if (!u?.isAdmin) { this.router.navigate(['/']); return; }
    this.authSub = this.auth.currentUser$.subscribe(val => {
      if (!val?.isAdmin) {
        this.router.navigate(['/']);
      }
    });
    this.loadUsers();
  }

  ngOnDestroy(): void { this.authSub?.unsubscribe(); }

  setTab(tab: 'stats' | 'annonces' | 'users') {
    this.activeTab = tab;
    if (tab === 'users' && !this.users.length) this.loadUsers();
    if (tab === 'annonces' && !this.properties.length) this.loadProperties();
  }

  loadProperties() {
    this.loadingProperties = true; this.propertyError='';
    this.propertyService.getAll().subscribe({
      next: props => { this.properties = props; this.loadingProperties=false; },
      error: err => { this.propertyError = err.error || 'Erreur chargement annonces'; this.loadingProperties=false; }
    });
  }

  statusLabel(p: Property): string {
    const map: any = { 0: 'DRAFT', 1: 'PUBLISHED', 2: 'ARCHIVED'};
    return (map[p.status] || p.status || '').toString();
  }

  publish(p: Property) { this.propAction(p, this.propertyService.publish.bind(this.propertyService)); }
  archive(p: Property) { this.propAction(p, this.propertyService.archive.bind(this.propertyService)); }
  draft(p: Property) { this.propAction(p, this.propertyService.draft.bind(this.propertyService)); }
  delete(p: Property) { if(!confirm('Supprimer cette annonce ?')) return; this.propAction(p, this.propertyService.delete.bind(this.propertyService), true); }

  private propAction(p: Property, fn: (id: string)=>any, removeAfter=false) {
    this.savingPropIds.add(p.id);
    fn(p.id).subscribe({
      next: () => {
        if (removeAfter) {
          this.properties = this.properties.filter(x => x.id !== p.id);
        } else {
          // reload just this property? simplest reload all
          this.loadProperties();
        }
      },
      error: () => {},
      complete: () => { this.savingPropIds.delete(p.id); }
    });
  }

  loadUsers() {
    this.loadingUsers = true; this.userError='';
    let allProps: Property[] = [];
    this.propertyService.getAll().subscribe({
      next: props => { allProps = props; this.fetchUsers(allProps); },
      error: () => { this.fetchUsers([]); }
    });
  }

  private fetchUsers(allProps: Property[]) {
    this.userService.getAll().subscribe({
      next: raw => {
        this.users = raw.map(u => ({
          ...u,
          isAdmin: u.role === 'ADMIN',
          propertyCount: allProps.filter(p => p.userId === u.id).length
        }));
        this.loadingUsers = false;
      },
      error: err => { this.userError = err.error || 'Erreur chargement users'; this.loadingUsers=false; }
    });
  }

  toggleAdmin(u: UserRow) {
    const target = !u.isAdmin;
    this.savingUserIds.add(u.id);
    this.userService.updateRoleStatus(u.id, target, u.status).subscribe({
      next: () => { u.isAdmin = target; u.role = target ? 'ADMIN' : 'ADVERTISER'; this.savingUserIds.delete(u.id); },
      error: () => { this.savingUserIds.delete(u.id); }
    });
  }

  deleteUser(u: UserRow) {
    if(!confirm('Supprimer cet utilisateur ?')) return;
    this.savingUserIds.add(u.id);
    this.userService.delete(u.id).subscribe({
      next: () => { this.users = this.users.filter(x => x.id !== u.id); },
      error: () => {},
      complete: () => { this.savingUserIds.delete(u.id); }
    });
  }
}

interface UserRow extends RawUser { propertyCount: number; isAdmin: boolean; }
