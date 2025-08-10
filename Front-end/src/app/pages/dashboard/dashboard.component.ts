import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PropertyCreateComponent } from '../property-create/property-create.component';
import { PropertyService, Property } from '../../services/property.service';
import { PropertyCardComponent } from '../../components/property-card/property-card.component';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, PropertyCreateComponent, PropertyCardComponent, ReactiveFormsModule],
  template: `
    <div class="dashboard-container">
      <div class="toolbar">
        <button (click)="toggleCreate()">{{ showCreate ? 'Fermer le formulaire' : 'Créer une annonce' }}</button>
        <button class="refresh" (click)="load()">Rafraîchir</button>
      </div>

      <div *ngIf="showCreate" class="create-wrapper">
        <app-property-create (ngSubmit)="onCreated()"></app-property-create>
      </div>

      <h2>Mes annonces</h2>
      <div *ngIf="loading" class="state">Chargement...</div>
      <div *ngIf="error" class="state error">{{ error }}</div>
      <div class="my-grid" *ngIf="!loading && !error && myProperties.length; else empty">
        <div class="item" *ngFor="let p of myProperties">
          <ng-container *ngIf="editingId !== p.id; else editFormTpl">
            <app-property-card [property]="p" [showStatus]="true"></app-property-card>
            <div class="actions">
              <button (click)="startEdit(p)">Modifier</button>
              <button (click)="archive(p)" *ngIf="statusOf(p) !== 'ARCHIVED'">Archiver</button>
              <button (click)="restore(p)" *ngIf="statusOf(p) === 'ARCHIVED'">Restaurer</button>
              <button class="danger" (click)="remove(p)">Supprimer</button>
            </div>
          </ng-container>
          <ng-template #editFormTpl>
            <form [formGroup]="editForm" (ngSubmit)="saveEdit(p)" class="edit-form">
              <div class="grid">
                <label>Titre<input type="text" formControlName="title" /></label>
                <label>Type<input type="text" formControlName="type" /></label>
                <label>Prix<input type="number" formControlName="price" /></label>
                <label>Surface<input type="number" formControlName="surface" /></label>
                <label class="full">Description<textarea rows="3" formControlName="description"></textarea></label>
                <fieldset class="full address-group" formGroupName="address">
                  <legend>Adresse</legend>
                  <label>Rue<input type="text" formControlName="street" /></label>
                  <label>Ville<input type="text" formControlName="city" /></label>
                  <label>Code Postal<input type="text" formControlName="zipCode" /></label>
                </fieldset>
              </div>
              <div class="actions inside">
                <button type="submit" [disabled]="editForm.invalid || saving">Enregistrer</button>
                <button type="button" (click)="cancelEdit()" [disabled]="saving">Annuler</button>
              </div>
              <div class="mini-state" *ngIf="saveError">{{ saveError }}</div>
            </form>
          </ng-template>
        </div>
      </div>
      <ng-template #empty>
        <div class="state">Aucune annonce.</div>
      </ng-template>
    </div>
  `,
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  showCreate = false;
  loading = false;
  error: string | null = null;
  myProperties: Property[] = [];

  editingId: string | null = null;
  editForm!: FormGroup;
  saving = false;
  saveError = '';

  constructor(public authService: AuthService, private propertyService: PropertyService, private fb: FormBuilder) {}

  ngOnInit(): void { this.load(); }

  toggleCreate() { this.showCreate = !this.showCreate; }

  onCreated() { this.showCreate = false; this.load(); }

  load() {
    const user = this.authService.currentUserSubject.value;
    if(!user) return;
    this.loading = true; this.error = null;
    this.propertyService.getAll().subscribe({
      next: props => { this.myProperties = props.filter(p => p.userId === user.id); this.loading = false; },
      error: err => { this.error = err.error || 'Erreur'; this.loading = false; }
    });
  }

  startEdit(p: Property) {
    this.editingId = p.id;
    this.saveError = '';
    this.editForm = this.fb.group({
      title: [p.title, [Validators.required, Validators.maxLength(120)]],
      description: [p.description, [Validators.required, Validators.minLength(10)]],
      type: [p.type, Validators.required],
      price: [p.price, [Validators.required, Validators.min(1)]],
      surface: [p.surface, [Validators.min(0)]],
      address: this.fb.group({
        street: [p.address?.street || '', Validators.required],
        city: [p.address?.city || '', Validators.required],
        zipCode: [p.address?.zipCode || '', [Validators.required, Validators.pattern('^\\d{4,10}$')]]
      })
    });
  }

  cancelEdit() {
    this.editingId = null;
  }

  saveEdit(original: Property) {
    if (!this.editForm.valid || !this.editingId) return;
    this.saving = true; this.saveError = '';
    const v = this.editForm.value;
    const payload = {
      title: v.title,
      description: v.description,
      type: v.type,
      price: v.price,
      surface: v.surface,
      address: v.address,
      userId: original.userId // not used by update endpoint, but we keep structure consistent
    } as any;
    this.propertyService.update(this.editingId, payload).subscribe({
      next: () => {
        // status unchanged; reload list
        this.saving = false;
        this.editingId = null;
        this.load();
      },
      error: err => { this.saveError = err.error || 'Erreur sauvegarde'; this.saving = false; }
    });
  }

  statusOf(p: Property): string {
    const map: any = { 0: 'DRAFT', 1: 'PUBLISHED', 2: 'ARCHIVED'};
    return (map[p.status] || p.status || '').toString();
  }

  afterAction() { this.load(); }
  setDraft(p: Property) { this.propertyService.draft(p.id).subscribe(() => this.afterAction()); }
  publish(p: Property) { this.propertyService.publish(p.id).subscribe(() => this.afterAction()); }
  archive(p: Property) { this.propertyService.archive(p.id).subscribe(() => this.afterAction()); }
  remove(p: Property) { if(confirm('Supprimer cette annonce ?')) this.propertyService.delete(p.id).subscribe(() => this.afterAction()); }
  restore(p: Property) { this.propertyService.publish(p.id).subscribe(() => this.afterAction()); }

  // modify button now only handles status switching kept if needed elsewhere
  modify(p: Property) {
    this.startEdit(p);
  }
  modifyLabel(p: Property): string { return 'Modifier'; }
}
