// src/api/NonMusic.ts

import { BaseApi } from "./BaseApi.ts";
import { AuthManager } from "../auth/AuthManager.ts";

export interface BooksAndPodcastsResult {
  title: string;
  blocks: any[];
}

export class NonMusicApi extends BaseApi {
  constructor(authManager: AuthManager) {
    super(authManager);
  }

  /**
   * Получить блоки книг и подкастов
   * GET /non-music/calague
   * 
   * @returns Результат с блоками книг и подкастов
   * 
   * @example
   * ```typescript
   * const result = await client.nonMusic.getBooksAndPodcasts();
   * console.log(`Блоков: ${result.blocks.length}`);
   * result.blocks.forEach(block => {
   *   console.log(`- ${block.title}`);
   * });
   * ```
   */
  async getBooksAndPodcasts(): Promise<BooksAndPodcastsResult> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: BooksAndPodcastsResult;
    }>(`/non-music/calague`);
    return response.result;
  }
}
