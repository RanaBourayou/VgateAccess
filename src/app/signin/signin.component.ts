import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { AuthRequest } from '../models/auth-request.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

 onSubmit(): void {
  if (!this.email || !this.password) {
    this.errorMessage = 'Please fill in both email and password';
    return;
  }

  const payload: AuthRequest = {
    email: this.email,
    password: this.password
  };

  this.authService.login(payload).subscribe({
    next: (res) => {
          console.log('Login response:', res);

      // Store token and role
         localStorage.setItem('userId', res.id?.toString() ?? ''); 
          localStorage.setItem('jwtToken', res.token);
      localStorage.setItem('userRole', res.role);
        localStorage.setItem('firstName', res.firstName ?? '');
  localStorage.setItem('lastName', res.lastName ?? '');
 
      console.log(`Successfully logged in as role: ${res.role}`);
console.log('mustChangePassword:', res.mustChangePassword);
if (res.mustChangePassword) {
  console.log('Redirecting to change-password');
  this.router.navigate(['/change-password']);
  return;
}
      // Redirect based on role
      switch (res.role) {
        case 'ADMIN':
          this.router.navigate(['/dashboard']);
          break;
        case 'RECEPTIONIST':
          this.router.navigate(['/recep']);
          break;
        case 'REQUESTER':
          this.router.navigate(['/request']);
          break;
        default:
          console.warn('Unknown role, redirecting to home.');
          this.router.navigate(['/']);
      }
    },
    error: (err) => {
      this.errorMessage = err.error?.error || 'Login failed';
      console.error('Login error:', this.errorMessage);
    }
  });
}

}