import { Injectable, signal } from '@angular/core';
import { AuthConfig, OAuthEvent, OAuthService, provideOAuthClient } from 'angular-oauth2-oidc';
import { filter } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isReady = signal(false);
  readonly isAuthenticated = signal(!environment.oauth.enabled);
  readonly displayName = signal<string>('Northstar Client');

  constructor(private oauthService: OAuthService) {}

  async initialize(): Promise<void> {
    if (!environment.oauth.enabled) {
      this.isReady.set(true);
      return;
    }

    const authConfig: AuthConfig = {
      issuer: environment.oauth.issuer,
      clientId: environment.oauth.clientId,
      scope: environment.oauth.scope,
      responseType: 'code',
      oidc: true,
      strictDiscoveryDocumentValidation: environment.oauth.requireHttps,
      requireHttps: environment.oauth.requireHttps,
      redirectUri: `${window.location.origin}/`,
      postLogoutRedirectUri: `${window.location.origin}/`,
      showDebugInformation: true
    };

    this.oauthService.configure(authConfig);
    this.oauthService.setupAutomaticSilentRefresh();

    this.oauthService.events
      .pipe(filter((event: OAuthEvent) => event.type === 'token_received' || event.type === 'logout'))
      .subscribe(() => this.syncState());

    await this.oauthService.loadDiscoveryDocumentAndTryLogin();
    this.syncState();
    this.isReady.set(true);
  }

  login(): void {
    if (!environment.oauth.enabled) {
      return;
    }

    this.oauthService.initLoginFlow();
  }

  logout(): void {
    if (!environment.oauth.enabled) {
      return;
    }

    this.oauthService.logOut();
    this.syncState();
  }

  getAccessToken(): string {
    if (!environment.oauth.enabled) {
      return '';
    }

    return this.oauthService.getAccessToken();
  }

  isOAuthEnabled(): boolean {
    return environment.oauth.enabled;
  }

  private syncState(): void {
    const hasValidToken = this.oauthService.hasValidAccessToken();
    const claims = this.oauthService.getIdentityClaims() as Record<string, string> | null;

    this.isAuthenticated.set(hasValidToken);
    this.displayName.set(claims?.['name'] ?? claims?.['preferred_username'] ?? 'Northstar Client');
  }
}

export const authProviders = [provideOAuthClient()];
