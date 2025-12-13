// src/auth/AuthManager.ts
import { TokenStorage } from './TokenStorage.ts';
import { ElectronOAuth } from './ElectronOAuth.ts';

export enum AuthState {
  UNAUTHORIZED = 'UNAUTHORIZED',
  AUTHORIZED = 'AUTHORIZED',
}

export interface AuthManagerOptions {
  oauth?: ElectronOAuth;
  storage?: TokenStorage;
  token?: string;
  storagePath?: string;
}

export class AuthManager {
  private oauth: ElectronOAuth;
  private storage: TokenStorage;
  private currentToken: string | null;
  public state: AuthState = AuthState.UNAUTHORIZED;

  constructor(options: AuthManagerOptions = {}) {
    this.oauth = options.oauth || new ElectronOAuth();
    this.storage = options.storage || new TokenStorage(options.storagePath);
    this.currentToken = options.token || null;
    
    // Если передан токен, сразу авторизуемся
    if (this.currentToken) {
      this.state = AuthState.AUTHORIZED;
    }
  }

  /**
   * Проверяет, есть ли токен (и не просрочен ли).
   */
  async getToken(): Promise<string | null> {
    if (this.currentToken) return this.currentToken;
    const token = await this.storage.getToken();
    return token ?? null;
  }

  /**
   * Принудительно начинает OAuth авторизацию через Electron BrowserWindow.
   */
  async login(): Promise<string> {
    const token = await this.oauth.authorize();
    this.currentToken = token;
    this.state = AuthState.AUTHORIZED;
    await this.storage.saveToken(token);
    return token;
  }

  /**
   * Возвращает токен, если он уже сохранён, иначе запускает OAuth авторизацию.
   */
  async requireToken(): Promise<string> {
    const existing = await this.getToken();

    if (existing) {
      this.state = AuthState.AUTHORIZED;
      return existing;
    }

    const newToken = await this.login();
    return newToken;
  }

  /**
   * Удаляет токен (logout).
   */
  async logout(): Promise<void> {
    this.currentToken = null;
    this.state = AuthState.UNAUTHORIZED;
    await this.storage.clearToken();
  }
}

