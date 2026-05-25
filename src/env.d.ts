/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// Google Identity Services — loaded via <script src="accounts.google.com/gsi/client"> in index.html.
declare namespace google {
  namespace accounts.oauth2 {
    interface TokenResponse {
      access_token: string;
      expires_in: number;
      scope: string;
      token_type: string;
      error?: string;
      error_description?: string;
    }
    interface TokenClientConfig {
      client_id: string;
      scope: string;
      callback: (response: TokenResponse) => void;
      error_callback?: (error: { type: string; message?: string }) => void;
    }
    interface TokenClient {
      requestAccessToken(overrideConfig?: {
        prompt?: '' | 'none' | 'consent' | 'select_account';
      }): void;
    }
    function initTokenClient(config: TokenClientConfig): TokenClient;
    function revoke(accessToken: string, done?: () => void): void;
  }
}
