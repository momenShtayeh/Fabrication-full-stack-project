import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { map } from 'rxjs';

import { AuthService } from '../core/auth/auth.service';

//the frame around every page after login: top bar, side menu and the page itself
@Component({
  selector: 'app-shell',
  imports: [
    MatButtonModule, MatIconModule, MatListModule, MatSidenavModule, MatToolbarModule, MatTooltipModule,
    RouterLink, RouterLinkActive, RouterOutlet
  ],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css'
})
export class ShellComponent {

  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  //on phones the menu slides over the page and closes after a click, on larger screens it stays open
  protected readonly isHandset = toSignal(
    inject(BreakpointObserver).observe(Breakpoints.Handset).pipe(map(result => result.matches)),
    { initialValue: false }
  );

  protected readonly links = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
    { path: '/materials', icon: 'inventory_2', label: 'Materials' },
    { path: '/isos', icon: 'description', label: 'ISOs' },
    { path: '/spools', icon: 'plumbing', label: 'Spools' },
    { path: '/batches', icon: 'precision_manufacturing', label: 'Batches' }
  ];

  protected closeOnHandset(sidenav: MatSidenav): void {
    if (this.isHandset()) {
      sidenav.close();
    }
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
