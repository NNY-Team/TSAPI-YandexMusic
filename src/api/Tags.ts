// src/api/Tags.ts

import { BaseApi } from "./BaseApi.ts";
import { AuthManager } from "../auth/AuthManager.ts";
import { Playlist } from "../models/Playlist.ts";

export interface Tag {
  id: string;
  value: string;
  name: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface PlaylistId {
  uid: number;
  kind: number;
}

export interface TagResult {
  tag: Tag;
  ids: PlaylistId[];
  playlists?: Playlist[];
}

export class TagsApi extends BaseApi {
  constructor(authManager: AuthManager) {
    super(authManager);
  }

  /**
   * Получить плейлисты по тегу (подборке)
   * GET /tags/{tagId}/playlist-ids
   * 
   * @param tagId - ID тега
   * @returns Результат с информацией о теге и плейлистах
   * 
   * @example
   * ```typescript
   * const result = await client.tags.getPlaylistsByTag('pop');
   * console.log(`Tag: ${result.tag.name}`);
   * console.log(`Плейлистов: ${result.ids.length}`);
   * ```
   */
  async getPlaylistsByTag(tagId: string): Promise<TagResult> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: TagResult;
    }>(`/tags/${tagId}/playlist-ids`);
    return response.result;
  }
}
