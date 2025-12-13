// src/api/Playlists.ts

import { BaseApi } from "./BaseApi.ts";
import { AuthManager } from "../auth/AuthManager.ts";
import { Playlist } from "../models/Playlist.ts";

export interface PlaylistChangeOperation {
  op: "insert" | "delete";
  at?: number;
  from?: number;
  to?: number;
  tracks: Array<{
    id: string;
    albumId: string;
  }>;
}

export class PlaylistsApi extends BaseApi {
  constructor(authManager: AuthManager) {
    super(authManager);
  }

  async get(userId: number, playlistKind: number): Promise<Playlist> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: Playlist;
    }>(`/users/${userId}/playlists/${playlistKind}`);
    return response.result;
  }

  async getList(userId: number): Promise<Playlist[]> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: Playlist[];
    }>(`/users/${userId}/playlists/list`);
    return response.result;
  }

  async getByIds(playlistIds: Array<{ uid: number; kind: number }>): Promise<Playlist[]> {
    const playlistIdStrings = playlistIds.map(p => `${p.uid}:${p.kind}`);
    const response = await this.http.post<{
      invocationInfo: any;
      result: Playlist[];
    }>(`/playlists/list`, { playlistIds: playlistIdStrings.join(",") });
    return response.result;
  }

  async create(
    userId: number,
    title: string,
    visibility: "public" | "private" = "private"
  ): Promise<Playlist> {
    const response = await this.http.post<{
      invocationInfo: any;
      result: Playlist;
    }>(`/users/${userId}/playlists/create`, { title, visibility });
    return response.result;
  }

  async rename(userId: number, playlistKind: number, newName: string): Promise<Playlist> {
    const response = await this.http.post<{
      invocationInfo: any;
      result: Playlist;
    }>(`/users/${userId}/playlists/${playlistKind}/name`, { value: newName });
    return response.result;
  }

  async delete(userId: number, playlistKind: number): Promise<void> {
    await this.http.post(`/users/${userId}/playlists/${playlistKind}/delete`, {});
  }

  async setVisibility(
    userId: number,
    playlistKind: number,
    visibility: "public" | "private"
  ): Promise<Playlist> {
    const response = await this.http.post<{
      invocationInfo: any;
      result: Playlist;
    }>(`/users/${userId}/playlists/${playlistKind}/visibility`, { value: visibility });
    return response.result;
  }

  async addTracks(
    userId: number,
    playlistKind: number,
    tracks: Array<{ id: string; albumId: string }>,
    at: number = 0
  ): Promise<Playlist> {
    const diff = JSON.stringify({
      op: "insert",
      at,
      tracks,
    });

    const response = await this.http.post<{
      invocationInfo: any;
      result: Playlist;
    }>(`/users/${userId}/playlists/${playlistKind}/change-relative`, {
      diff,
      revision: "0",
    });
    return response.result;
  }

  async removeTracks(
    userId: number,
    playlistKind: number,
    tracks: Array<{ id: string; albumId: string }>,
    from: number = 0,
    to: number = 1
  ): Promise<Playlist> {
    const diff = JSON.stringify({
      op: "delete",
      from,
      to,
      tracks,
    });

    const response = await this.http.post<{
      invocationInfo: any;
      result: Playlist;
    }>(`/users/${userId}/playlists/${playlistKind}/change-relative`, {
      diff,
      revision: "0",
    });
    return response.result;
  }

  async getRecommendations(userId: number, playlistKind: number): Promise<any> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: any;
    }>(`/users/${userId}/playlists/${playlistKind}/recommendations`);
    return response.result;
  }
}

