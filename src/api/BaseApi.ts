// src/api/BaseApi.ts

import { HttpClient } from "../http/client.ts";
import { AuthManager } from "../auth/AuthManager.ts";

export class BaseApi {
  protected http: HttpClient;
  protected auth: AuthManager;

  constructor(authManager: AuthManager) {
    this.auth = authManager;
    // Use CORS proxy in browser environment
    const isBrowser = typeof window !== 'undefined';
    this.http = new HttpClient(authManager, isBrowser);
  }
}

