import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent    {
    firstName!: string;
    lastName!: string;
    role!: string;
    menuOpen = false;

  constructor(private router: Router) {
    this.firstName = localStorage.getItem('firstName') || 'Réceptionniste';
    this.lastName = localStorage.getItem('lastName') || '';
    this.role = localStorage.getItem('userRole') || '';
  }
 
    toggleMenu(event: Event) {
      event.stopPropagation();
      this.menuOpen = !this.menuOpen;
    }
      goToAccount() {
      this.menuOpen = false;
      this.router.navigate(['/account']);
    }
  
    logout() {
      localStorage.clear();
      this.router.navigate(['/signin']);
    }
  
    // Close menu when clicking anywhere else
    @HostListener('document:click', ['$event'])
    onClick(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-profile')) {
        this.menuOpen = false;
      }
    }
   
}
