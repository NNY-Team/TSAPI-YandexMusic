// src/api/Account.ts

import { BaseApi } from "./BaseApi.ts";
import { AuthManager } from "../auth/AuthManager.ts";

export interface AccountStatus {
  account: {
    uid: number;
    login: string;
    fullName?: string;
    secondName?: string;
    firstName?: string;
    displayName?: string;
    sex?: string;
    verified: boolean;
    homelocation?: string;
    socialProfiles?: Array<{
      provider: string;
      userId: string;
      profileUrl?: string;
    }>;
    now: string;
    seedLimit: number;
    regionInfo?: {
      region?: string;
      country?: string;
      latitude?: number;
      longitude?: number;
    };
  };
  subscription?: {
    canStartTrial: boolean;
    mcdonalds: boolean;
    hasPlus: boolean;
  };
  permissions?: string[];
  premium?: {
    until: string;
    articles: string[];
  };
}

export interface UserSettings {
  theme?: string;
  volumePercents?: number;
  adsDisabled?: boolean;
  [key: string]: any;
}

export interface Experiments {
  [key: string]: any;
}

export class AccountApi extends BaseApi {
  constructor(authManager: AuthManager) {
    super(authManager);
  }

  async getStatus(): Promise<AccountStatus> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: AccountStatus;
    }>(`/account/status`);
    return response.result;
  }

  async getSettings(): Promise<UserSettings> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: UserSettings;
    }>(`/account/settings`);
    return response.result;
  }

  async updateSettings(settings: UserSettings): Promise<UserSettings | null> {
    const response = await this.http.post<{
      invocationInfo: any;
      result: UserSettings | null;
    }>(`/account/settings`, this.encodeFormData(settings));
    return response.result;
  }

  async getExperiments(): Promise<Experiments> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: Experiments;
    }>(`/account/experiments`);
    return response.result;
  }

  private encodeFormData(data: Record<string, any>): string {
    return Object.entries(data)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
  }

  /**
   * Активировать промо-код
   * POST /account/consume-promo-code
   * 
   * @param code - Код промо
   * @param language - Язык (опционально)
   * @returns Статус активации
   * 
   * @example
   * ```typescript
   * const result = await client.account.consumePromoCode('PROMO2025');
   * console.log(`Статус: ${result.status}`);
   * ```
   */
  async consumePromoCode(code: string, language?: string): Promise<any> {
    const response = await this.http.post<{
      invocationInfo: any;
      result: any;
    }>(`/account/consume-promo-code`, {
      code,
      language,
    });
    return response.result;
  }
}

