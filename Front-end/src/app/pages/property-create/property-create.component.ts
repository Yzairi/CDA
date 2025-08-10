import { Component } from '@angular/core';
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
      ...this.form.value,
      userId: currentUser.id
    };

    this.propertyService.create(payload).subscribe({
      next: (prop) => {
        this.successMessage = 'Annonce créée (id: ' + prop.id + ')';
        this.form.reset();
        this.submitted = false;
      },
      error: (err) => {
        this.errorMessage = err.error || 'Erreur lors de la création';
      }
    });
  }
}
