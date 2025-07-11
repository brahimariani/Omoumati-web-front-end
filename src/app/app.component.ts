import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatSnackBarModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Omoumati';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Debug initial immédiat
    console.log('🚀 App Component Init (immédiat):', {
      isLoggedIn: this.authService.isLoggedIn(),
      token: !!this.authService.getToken(),
      tokenValue: this.authService.getToken()?.substring(0, 50) + '...',
      currentUrl: window.location.href
    });

    // Debug après un délai pour voir l'état une fois que l'AuthService a fini son init
    setTimeout(() => {
      console.log('🔄 App Component Check (après délai):', {
        isLoggedIn: this.authService.isLoggedIn(),
        token: !!this.authService.getToken(),
        currentUrl: window.location.href
      });
      
      // S'abonner aux observables pour voir les changements
      this.authService.getCurrentUser().subscribe(user => {
        console.log('👤 App - Current user from observable:', user);
      });
      
      this.authService.isAuthenticated$.subscribe(isAuth => {
        console.log('🔐 App - Auth state from observable:', isAuth);
      });
    }, 200);
  }
}
