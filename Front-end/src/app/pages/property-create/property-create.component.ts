import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropertyService, CreatePropertyPayload } from '../../services/property.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-property-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './property-create.component.html',
  styleUrls: ['./property-create.component.css']
})
export class PropertyCreateComponent {
  form: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  types = ['APPARTEMENT', 'MAISON', 'STUDIO', 'TERRAIN'];
  lastCreatedPropertyId: string | null = null;
  uploading = false;
  uploadedImageUrl: string | null = null;
  // New: multiple image selection before creation
  selectedFiles: File[] = [];
  previews: { name: string; url: string }[] = [];
  uploadedImages: { id: string; url: string; order: number }[] = [];
  @Output() created = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private propertyService: PropertyService, private authService: AuthService) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(120)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      type: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      surface: [0, [Validators.min(0)]],
      address: this.fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        zipCode: ['', [Validators.required, Validators.pattern('^\\d{4,10}$')]]
      })
    });
  }

  get f() { return this.form.controls; }
  get addressGroup() { return (this.form.get('address') as FormGroup).controls; }

  onSubmit(): void {
    this.submitted = true;
    this.successMessage = '';
    this.errorMessage = '';
    if (this.form.invalid) return;

    const currentUser = this.authService.currentUserSubject.value;
    if(!currentUser){
      this.errorMessage = 'Vous devez être connecté';
      return;
    }

    const payload: CreatePropertyPayload = {
      ...this.form.value
    };

    this.propertyService.create(payload).subscribe({
      next: (prop) => {
        this.lastCreatedPropertyId = prop.id;
        // If images selected, upload them immediately
    if (this.selectedFiles.length) {
          this.uploading = true;
          this.propertyService.uploadImages(prop.id, this.selectedFiles).subscribe({
            next: (imgs) => {
              this.uploadedImages = imgs;
              this.uploading = false;
              this.successMessage = 'Annonce créée avec ' + imgs.length + ' image(s).';
              this.resetFormButKeepImagesState();
        this.created.emit();
            },
            error: (err) => {
              this.uploading = false;
              this.successMessage = 'Annonce créée mais échec upload images';
              this.errorMessage = err.error || 'Erreur upload images';
        this.created.emit();
            }
          });
        } else {
          this.successMessage = 'Annonce créée (id: ' + prop.id + ')';
          this.resetFormButKeepImagesState();
      this.created.emit();
        }
      },
      error: (err) => {
        this.errorMessage = err.error || 'Erreur lors de la création';
      }
    });
  }

  onFileSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    // Allow multiple selection; append new
    for (const f of Array.from(input.files)) {
      // basic validations (size < 5MB & type)
      if (f.size > 5_000_000) {
        this.errorMessage = 'Fichier trop grand (>5MB): ' + f.name;
        continue;
      }
      if (!/^image\//.test(f.type)) {
        this.errorMessage = 'Type non image: ' + f.name;
        continue;
      }
      this.selectedFiles.push(f);
      const url = URL.createObjectURL(f);
      this.previews.push({ name: f.name, url });
    }
    // reset input so same file can be re-added if removed then added again
    input.value = '';
  }

  removeImage(idx: number) {
    const pv = this.previews[idx];
    URL.revokeObjectURL(pv.url);
    this.previews.splice(idx,1);
    this.selectedFiles.splice(idx,1);
  }

  private resetFormButKeepImagesState() {
    this.form.reset();
    this.submitted = false;
    // Clear selections after submission
    this.selectedFiles = [];
    this.previews.forEach(p => URL.revokeObjectURL(p.url));
    this.previews = [];
  }
}
