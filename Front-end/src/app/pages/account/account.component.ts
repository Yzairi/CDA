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
          this.error = err.error || 'Login failed';
        }
      });
    } else {
      this.authService.register(email, password).subscribe({
        next: () => {
          this.isLoginMode = true;
          this.form.reset();
          this.error = null;
        },
        error: (err: any) => {
          this.error = err.error || 'Registration failed';
        }
      });
    }
  }
}