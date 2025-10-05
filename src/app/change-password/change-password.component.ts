import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent {
  changePasswordForm: FormGroup;
  errorMessage = '';
  successMessage = '';

  constructor(private fb: FormBuilder, private http: HttpClient, private router: Router) {
    this.changePasswordForm = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  oldPassword: ['', Validators.required],
  newPassword: ['', Validators.required],
  confirmPassword: ['', Validators.required]
});
  }
changePassword(): void {
  const { email, oldPassword, newPassword, confirmPassword } = this.changePasswordForm.value;

  if (newPassword !== confirmPassword) {
    this.errorMessage = 'New passwords do not match.';
    this.successMessage = '';
    return;
  }

  this.http.put<{ text?: string, error?: string }>('http://localhost:8080/visteonS/api/auth/change-password', {
    email,
    oldPassword,
    newPassword
  }).subscribe({
    next: (response) => {
      if (response.text) {
        this.successMessage = response.text;
        this.errorMessage = '';
        this.changePasswordForm.reset();

        setTimeout(() => {
          this.router.navigate(['/signin']);
        }, 1500);
      } else if (response.error) {
        this.errorMessage = response.error;
        this.successMessage = '';
      }
    },
    error: (err) => {
      if (err.error && typeof err.error === 'object' && 'error' in err.error) {
        this.errorMessage = err.error.error;
      } else if (err.error && typeof err.error === 'string') {
        this.errorMessage = err.error;
      } else {
        this.errorMessage = 'Password change failed';
      }
      this.successMessage = '';
    }
  });
}

}
