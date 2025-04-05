import { Router } from '@angular/router';

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '@services/auth.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, OnDestroy {
  formData = {
    username: '',
    password: '',
  };
  isLoading = false;
  errorMessage = '';
  login$: Subscription | undefined;
  isPasswordVisible = false; // Tracks visibility of the password

  constructor(private authService: AuthService, private router: Router) {
    if (localStorage.getItem('authToken')) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy() {
    this.login$?.unsubscribe();
  }
  ngOnInit() {
    this.formData = {
      username: '',
      password: '',
    };
  }

  onSubmit() {
    this.isLoading = true;
    this.errorMessage = '';
    this.login$ = this.authService.login(this.formData).subscribe({
      next: (response) => {
        this.isLoading = false;

        // Extract token
        const token = response?.data?.token;
        // console.log(response);
        if (token) {
          localStorage.setItem('authToken', token);
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = 'Login failed: Token not received';
        }
      },
      error: ({ message }) => {
        this.isLoading = false;
        this.errorMessage = message;
      },
    });
  }



  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
