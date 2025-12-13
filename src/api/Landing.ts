// src/api/Landing.ts

import { BaseApi } from "./BaseApi.ts";
import { AuthManager } from "../auth/AuthManager.ts";

export interface LandingBlock {
  type: string;
  title?: string;
  id: string;
  entities?: any[];
}

export interface Landing {
  blocks: LandingBlock[];
}

export interface Genre {
  id: string;
  name: string;
  imageUrl?: string;
}

export class LandingApi extends BaseApi {
  constructor(authManager: AuthManager) {
    super(authManager);
  }

  /**
   * Получить блоки главной страницы
   * GET /landing3
   * 
   * @param blockTypes - Типы блоков (например: "playlist_of_the_day,chart_week")
   * @returns Объект с блоками главной страницы
   */
  async getLanding(blockTypes?: string[]): Promise<any> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: Landing;
    }>(`/landing3`, {
      blocks: blockTypes?.join(","),
    });
    return response.result;
  }

  /**
   * Получить конкретный блок главной страницы
   * GET /landing3/{landingBlock}
   * 
   * @param landingBlock - ID или название блока
   * @returns Результат блока
   */
  async getLandingBlock(landingBlock: string): Promise<any> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: any;
    }>(`/landing3/${landingBlock}`);
    return response.result;
  }

  /**
   * Получить новые релизы
   * GET /landing3/new-releases
   * 
   * @returns Блок с новыми релизами
   */
  async getNewReleases(): Promise<any> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: any;
    }>(`/landing3/new-releases`);
    return response.result;
  }

  /**
   * Получить подкасты
   * GET /landing3/podcasts
   * 
   * @returns Блок с подкастами
   */
  async getPodcasts(): Promise<any> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: any;
    }>(`/landing3/podcasts`);
    return response.result;
  }

  /**
   * Получить новые плейлисты
   * GET /landing3/new-playlists
   * 
   * @returns Блок с новыми плейлистами
   */
  async getNewPlaylists(): Promise<any> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: any;
    }>(`/landing3/new-playlists`);
    return response.result;
  }

  /**
   * Получить чарты
   * GET /landing3/chart/{chartType}
   * 
   * @param chartType - Тип чарта (например: "world", "russia", "mosaic")
   * @returns Блок с чартом
   */
  async getChart(chartType: string = "world"): Promise<any> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: any;
    }>(`/landing3/chart/${chartType}`);
    return response.result;
  }

  /**
   * Получить плейлист дня
   * GET /landing3 (blocks=playlist_of_the_day)
   * 
   * @returns Плейлист дня
   */
  async getPlaylistOfTheDay(): Promise<any> {
    return this.getLanding(["playlist_of_the_day"]);
  }

  /**
   * Получить чарт недели
   * GET /landing3 (blocks=chart_week)
   * 
   * @returns Чарт недели
   */
  async getChartWeek(): Promise<any> {
    return this.getLanding(["chart_week"]);
  }

  /**
   * Получить чарт месяца
   * GET /landing3 (blocks=chart_month)
   * 
   * @returns Чарт месяца
   */
  async getChartMonth(): Promise<any> {
    return this.getLanding(["chart_month"]);
  }

  /**
   * Получить список жанров
   * GET /genres
   * 
   * @returns Массив жанров
   * 
   * @example
   * ```typescript
   * const genres = await client.landing.getGenres();
   * genres.forEach(genre => {
   *   console.log(`${genre.name}`);
   * });
   * ```
   */
  async getGenres(): Promise<Genre[]> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: Genre[];
    }>(`/genres`);
    return response.result;
  }
}


