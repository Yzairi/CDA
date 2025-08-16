import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { PropertyCreateComponent } from '../property-create/property-create.component';
import { PropertyService, Property } from '../../services/property.service';
import { PropertyCardUserComponent } from '../../components/property-card-user/property-card-user.component';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, PropertyCreateComponent, PropertyCardUserComponent, ReactiveFormsModule],
  template: `
    <div class="dashboard-container">
      <div class="toolbar">
        <button (click)="toggleCreate()">{{ showCreate ? 'Fermer le formulaire' : 'Créer une annonce' }}</button>
        <button class="refresh" (click)="load()">Rafraîchir</button>
      </div>

      <div *ngIf="showCreate" class="create-wrapper">
        <app-property-create (created)="onCreated()"></app-property-create>
      </div>

      <h2>Mes annonces</h2>
      <div *ngIf="loading" class="state">Chargement...</div>
      <div *ngIf="error" class="state error">{{ error }}</div>
      <div class="my-grid" *ngIf="!loading && !error && myProperties.length; else empty">
        <div class="item" [class.editing]="editingId === p.id" *ngFor="let p of myProperties">
          <ng-container *ngIf="editingId !== p.id; else editFormTpl">
            <app-property-card-user [property]="p" [showStatus]="true"></app-property-card-user>
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
                <label>
                  Titre de l'annonce
                  <input type="text" formControlName="title" placeholder="Titre de votre annonce" />
                </label>
                <label>
                  Type de bien
                  <input type="text" formControlName="type" placeholder="Ex: Appartement, Maison..." />
                </label>
                <label>
                  Prix (€)
                  <input type="number" formControlName="price" placeholder="Prix en euros" />
                </label>
                <label>
                  Surface (m²)
                  <input type="number" formControlName="surface" placeholder="Surface en m²" />
                </label>
                <label class="full">
                  Description détaillée
                  <textarea rows="4" formControlName="description" placeholder="Décrivez votre bien en détail..."></textarea>
                </label>
                <fieldset class="full address-group" formGroupName="address">
                  <legend>Adresse du bien</legend>
                  <div class="grid">
                    <label>
                      Rue et numéro
                      <input type="text" formControlName="street" placeholder="Ex: 123 Rue de la République" />
                    </label>
                    <label>
                      Ville
                      <input type="text" formControlName="city" placeholder="Ville" />
                    </label>
                    <label>
                      Code postal
                      <input type="text" formControlName="zipCode" placeholder="Code postal" />
                    </label>
                  </div>
                </fieldset>
                <div class="full images-block">
                  <div class="images-header">
                    <strong>Gestion des photos</strong>
                    <input type="file" multiple (change)="onAddImages($event, p)" accept="image/*" />
                  </div>
                  <div class="images-grid" *ngIf="p.images?.length; else noImg">
                    <div class="img-item" *ngFor="let img of getImages(p); let i = index">
                      <img [src]="img.url" alt="Photo {{i+1}}" />
                      <div class="img-actions">
                        <button type="button" (click)="moveImage(p, i, -1)" [disabled]="i===0" title="Monter">↑</button>
                        <button type="button" (click)="moveImage(p, i, 1)" [disabled]="i===p.images!.length-1" title="Descendre">↓</button>
                        <button type="button" class="danger" (click)="deleteImage(p, img)" title="Supprimer">✕</button>
                      </div>
                    </div>
                  </div>
                  <ng-template #noImg>
                    <div class="no-img">Aucune photo ajoutée</div>
                  </ng-template>
                  <div class="mini-state" *ngIf="imgError">{{ imgError }}</div>
                </div>
              </div>
              <div class="actions inside">
                <button type="button" (click)="cancelEdit()" [disabled]="saving">
                  Annuler
                </button>
                <button type="submit" [disabled]="editForm.invalid || saving">
                  Enregistrer les modifications
                </button>
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

  constructor(public authService: AuthService, private propertyService: PropertyService, private fb: FormBuilder, private router: Router, private confirmationService: ConfirmationService) {}

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
      // Redirect admins to dedicated admin dashboard
      this.router.navigate(['/admin']);
      return;
    }
    this.load();
  }

  toggleCreate() { this.showCreate = !this.showCreate; }

  onCreated() { this.showCreate = false; this.load(); }

  load() {
    const user = this.authService.currentUserSubject.value;
    if(!user) return;
    this.loading = true; this.error = null;
    this.propertyService.getAll().subscribe({
      next: props => { 
        this.myProperties = props.filter(p => p.userId === user.id); 
        this.loading = false; },
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
      address: v.address
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
  
  async publish(p: Property) { 
    const confirmed = await this.confirmationService.confirmPublish(p.title);
    if (confirmed) {
      this.propertyService.publish(p.id).subscribe(() => this.afterAction());
    }
  }
  
  async archive(p: Property) { 
    const confirmed = await this.confirmationService.confirmArchive(p.title);
    if (confirmed) {
      this.propertyService.archive(p.id).subscribe(() => this.afterAction());
    }
  }
  
  async remove(p: Property) { 
    const confirmed = await this.confirmationService.confirmDelete(p.title);
    if (confirmed) {
      this.propertyService.delete(p.id).subscribe(() => this.afterAction());
    }
  }
  
  restore(p: Property) { this.propertyService.publish(p.id).subscribe(() => this.afterAction()); }

  // modify button now only handles status switching kept if needed elsewhere
  modify(p: Property) {
    this.startEdit(p);
  }
  modifyLabel(p: Property): string { return 'Modifier'; }

  imgError = '';

  onAddImages(evt: Event, p: Property) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || !input.files.length) return;
    const files = Array.from(input.files);
    // upload new images
    this.propertyService.uploadImages(p.id, files).subscribe({
      next: imgs => { p.images = (p.images || []).concat(imgs).sort((a,b)=>a.order-b.order); input.value=''; },
      error: err => { this.imgError = err.error || 'Erreur upload images'; }
    });
  }

  moveImage(p: Property, index: number, delta: number) {
    if (!p.images) return;
    const newIndex = index + delta;
    if (newIndex < 0 || newIndex >= p.images.length) return;
    const arr = [...p.images];
    const [item] = arr.splice(index,1);
    arr.splice(newIndex,0,item);
    // reassign order locally
    arr.forEach((img,i)=> img.order = i);
    p.images = arr;
    this.syncReorder(p);
  }

  private syncReorder(p: Property) {
    if (!p.images) return;
    const ids = p.images.sort((a,b)=>a.order-b.order).map(i=> i.id);
    this.propertyService.reorderImages(p.id, ids).subscribe({ error: ()=>{} });
  }

  async deleteImage(p: Property, img: {id:string}) {
    const confirmed = await this.confirmationService.confirmDelete('cette image');
    if (!confirmed) return;
    
    this.propertyService.deleteImage(p.id, img.id).subscribe({
      next: () => { if(p.images) p.images = p.images.filter(i=> i.id!==img.id).map((i,idx)=> ({...i, order: idx})); this.syncReorder(p); },
      error: err => { this.imgError = err.error || 'Erreur suppression image'; }
    });
  }

  getImages(p: Property) {
    return (p.images || []).slice().sort((a,b)=> a.order - b.order);
  }
}
