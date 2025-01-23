// checklogin.component.ts
import { Component, OnInit } from '@angular/core';
import { MSAL_INSTANCE, MsalModule, MsalService, MsalBroadcastService } from '@azure/msal-angular';
import { IPublicClientApplication, PublicClientApplication, InteractionStatus, AuthenticationResult } from '@azure/msal-browser';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { InteractionStatusService } from '../../../services/interaction-status.service'; 
import { filter } from 'rxjs/operators';
import { environment } from '../../../Environments/environments.dev'; 

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.authConfig.clientId,
      redirectUri: environment.authConfig.redirectUri
    }
  });
}

@Component({
  selector: 'app-checklogin',
  imports: [CommonModule, MsalModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory
    },
    MsalService,
    MsalBroadcastService,
    InteractionStatusService
  ]
})
export class LoginComponent implements OnInit {
  public userEmail: string | null = null;
  private apiBaseUrl = environment.apiBaseUrl;

  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private interactionStatusService: InteractionStatusService,
    private http: HttpClient,
    private router: Router
  ) {}

  async ngOnInit() {
    // Ensure the MSAL instance is initialized before any other operation
    await this.msalService.instance.initialize();

    // Listen to interaction status changes
    this.msalBroadcastService.inProgress$
      .pipe(filter(status => status === InteractionStatus.None))
      .subscribe(() => {
        this.interactionStatusService.setInteractionInProgress(false);
      });

    this.msalBroadcastService.inProgress$
      .pipe(filter(status => status === InteractionStatus.Login || status === InteractionStatus.AcquireToken))
      .subscribe(() => {
        this.interactionStatusService.setInteractionInProgress(true);
      });
  }

  isLoggedIn(): boolean {
    return this.msalService.instance.getActiveAccount() != null;
  }

  async login() {
    if (!this.interactionStatusService.isInteractionInProgress()) {
      try {
        const response = await this.msalService.loginPopup().toPromise();
        if (response) {
          this.msalService.instance.setActiveAccount(response.account);
          this.userEmail = response.account?.username || null; // Store the email address
          if (this.userEmail) {
            this.callApiAndRedirect(this.userEmail);
          }
        }
      } catch (error) {
        console.error('Error during login:', error);
      }
    } else {
      console.log('Interaction already in progress. Please wait for it to complete.');
    }
  }

  async callApiAndRedirect(email: string) {
    try {
      const response = await this.http.get<{ profileName: string }>(`${this.apiBaseUrl}/Login/login?email=${encodeURIComponent(email)}`).toPromise(); 
      const profileName = response?.profileName?.toLowerCase();
      if (profileName === 'admin') {
        this.router.navigate(['/dashboard']);
      } else if (profileName === 'superadmin') {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/auth/register']);
      }
    } catch (error) {
      console.error('Error calling API:', error);
    }
  }
  
}
