import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-test-routing',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card style="margin: 20px; padding: 20px;">
      <h2>🧪 Test Routing & Authentication</h2>
      
      <div style="margin: 20px 0;">
        <h3>État Actuel :</h3>
        <ul>
          <li><strong>Connecté :</strong> {{ isLoggedIn ? '✅ Oui' : '❌ Non' }}</li>
          <li><strong>Token :</strong> {{ hasToken ? '✅ Présent' : '❌ Absent' }}</li>
          <li><strong>URL :</strong> {{ currentUrl }}</li>
        </ul>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Actions de Test :</h3>
        <button mat-raised-button (click)="clearStorage()" style="margin: 5px;">
          🗑️ Vider localStorage
        </button>
        <button mat-raised-button (click)="goToLogin()" style="margin: 5px;">
          🔐 Aller à Login
        </button>
        <button mat-raised-button (click)="goToPatientes()" style="margin: 5px;">
          👥 Aller à Patientes
        </button>
        <button mat-raised-button (click)="checkState()" style="margin: 5px;">
          🔍 Vérifier État
        </button>
        <button mat-raised-button (click)="forceAuthCheck()" style="margin: 5px;">
          🔄 Forcer Vérif Auth
        </button>
      </div>
      
      <div style="margin: 20px 0;">
        <h3>Console Logs :</h3>
        <pre style="background: #f5f5f5; padding: 10px; font-family: monospace;">{{ logs }}</pre>
      </div>
    </mat-card>
  `
})
export class TestRoutingComponent {
  isLoggedIn = false;
  hasToken = false;
  currentUrl = '';
  logs = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.updateState();
  }

  updateState(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.hasToken = !!this.authService.getToken();
    this.currentUrl = window.location.href;
    this.addLog(`État mis à jour: logged=${this.isLoggedIn}, token=${this.hasToken}`);
  }

  clearStorage(): void {
    localStorage.clear();
    sessionStorage.clear();
    this.addLog('🗑️ Storage vidé');
    this.updateState();
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
    this.addLog('🔐 Navigation vers /auth/login');
  }

  goToPatientes(): void {
    this.router.navigate(['/patientes']);
    this.addLog('👥 Navigation vers /patientes');
  }

  checkState(): void {
    this.updateState();
    this.addLog('🔍 État vérifié');
  }

  forceAuthCheck(): void {
    this.authService.checkAuthState();
    setTimeout(() => {
      this.updateState();
      this.addLog('🔄 Vérification forcée d\'authentification');
    }, 100);
  }

  private addLog(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.logs = `[${timestamp}] ${message}\n${this.logs}`;
    console.log(`[TestRouting] ${message}`);
  }
} 