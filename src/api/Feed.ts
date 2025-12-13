// src/api/Feed.ts

import { BaseApi } from "./BaseApi.ts";
import { AuthManager } from "../auth/AuthManager.ts";

export interface FeedDay {
  date: string;
  events: any[];
}

export interface FeedResult {
  canGetMoreEvents: boolean;
  days: FeedDay[];
  generatedPlaylists: any[];
  headlines: any[];
  isWizardPassed: boolean;
  pumpkin: boolean;
  today: string;
}

export class FeedApi extends BaseApi {
  constructor(authManager: AuthManager) {
    super(authManager);
  }

  /**
   * Получить ленту главной страницы
   * GET /feed
   * 
   * @returns Результат ленты
   * 
   * @example
   * ```typescript
   * const feed = await client.feed.getFeed();
   * console.log(`Всего дней: ${feed.days.length}`);
   * console.log(`Плейлисты: ${feed.generatedPlaylists.length}`);
   * ```
   */
  async getFeed(): Promise<FeedResult> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: FeedResult;
    }>(`/feed`);
    return response.result;
  }
}
