import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupportService, SupportData, ContactForm } from '../support.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './support.html',
  styleUrl: './support.css'
})
export class Support implements OnInit {
  supportData: SupportData | null = null;
  loading = true;
  error = '';
  contactForm: ContactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };
  formSubmitted = false;
  formMessage = '';

  constructor(private router: Router, private supportService: SupportService, private auth: AuthService) {}

  ngOnInit() {
    this.loadSupportData();
  }

  loadSupportData() {
    this.loading = true;
    this.supportService.getSupportData().subscribe({
      next: (data) => {
        this.supportData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading support data:', err);
        this.error = 'Failed to load support data.';
        this.loading = false;
      }
    });
  }

  submitForm() {
    if (!this.contactForm.name || !this.contactForm.email || !this.contactForm.message) {
      this.formMessage = 'Please fill in all required fields.';
      return;
    }

    this.supportService.submitContactForm(this.contactForm).subscribe({
      next: (response) => {
        this.formSubmitted = true;
        this.formMessage = response.message;
        this.contactForm = { name: '', email: '', subject: '', message: '' };
      },
      error: (err) => {
        console.error('Error submitting form:', err);
        this.formMessage = 'Failed to send message. Please try again.';
      }
    });
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      // Before, this only changed the page and the user stayed logged in.
      this.auth.logout();
    }
  }
}

