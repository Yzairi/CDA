import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class AccountComponent {
  isLoginMode = true;
  form: FormGroup;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.error = null;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    const { email, password } = this.form.value;

    if (this.isLoginMode) {
      this.authService.login(email, password).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
          this.error = null;
        },
        error: (err: any) => {
          // Traduire les erreurs en français
          if (err.status === 401) {
            this.error = 'Identifiants incorrects. Vérifiez votre email et mot de passe.';
          } else if (err.status === 404) {
            this.error = 'Compte non trouvé. Vérifiez votre adresse e-mail.';
          } else {
            this.error = err.error?.message || 'Erreur de connexion. Veuillez réessayer.';
          }
        }
      });
    } else {
      this.authService.register(email, password).subscribe({
        next: (res) => {
          this.error = null;
          // Redirection selon le flag admin
          if (res.isAdmin) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err: any) => {
          // Traduire les erreurs en français
          if (err.status === 409) {
            this.error = 'Cette adresse e-mail est déjà utilisée.';
          } else if (err.status === 400) {
            this.error = 'Données invalides. Vérifiez vos informations.';
          } else {
            this.error = err.error?.message || "Erreur lors de l'inscription. Veuillez réessayer.";
          }
        }
      });
    }
  }
}