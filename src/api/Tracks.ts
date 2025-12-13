// src/api/Tracks.ts

import { BaseApi } from "./BaseApi.ts";
import { AuthManager } from "../auth/AuthManager.ts";
import { Track } from "../models/Track.ts";
import { md5Hash } from "../utils/hashUtils.ts";

export interface DownloadInfo {
  downloadInfoUrl: string;
  codec: string;
  gain: boolean;
  preview: boolean;
  diffStereoEnabled: boolean;
  bitrateInKbps: number;
}

export interface TrackSupplement {
  lyrics?: Array<{
    id: string;
    lyrics: string;
  }>;
  videos?: Array<{
    title: string;
    cover: string;
    url: string;
  }>;
}

export interface SimilarTracks {
  track: Track;
  similars: Track[];
}

export class TracksApi extends BaseApi {
  constructor(authManager: AuthManager) {
    super(authManager);
  }

  async get(trackId: string): Promise<Track> {
    const tracks = await this.getMany([trackId]);
    return tracks[0] || ({} as Track);
  }

  
  async getMany(trackIds: string[]): Promise<Track[]> {
    const formData = new URLSearchParams();
    trackIds.forEach((id) => formData.append("track-ids", id));

    const response = await this.http.post<{ invocationInfo: any; result: Track[] }>(
      `/tracks`,
      formData
    );

    return response.result || [];
  }

  async getDownloadInfo(trackId: string): Promise<DownloadInfo[]> {
    const response = await this.http.get<{ invocationInfo: any; result: DownloadInfo[] }>(
      `/tracks/${trackId}/download-info`
    );
    return response.result;
  }

  async getDownloadInfoRaw(trackId: string): Promise<any> {
    return this.http.get<any>(`/tracks/${trackId}/download-info`);
  }

  /**
   * Получение прямой ссылки на mp3 трек
   * Выбирает нужный формат по битрейту или первый доступный
   */
  async getTrackURL(trackId: string, preferredBitrate = 320): Promise<string> {
    const raw = await this.getDownloadInfoRaw(trackId);

    if (!raw?.result?.length) throw new Error("Download info отсутствует");

    const info = raw.result.find((i: any) => i.bitrateInKbps === preferredBitrate) || raw.result[0];

    const downloadJsonRes = await this.http.get<any>(`${info.downloadInfoUrl}&format=json`);

    const download = downloadJsonRes; // исправлено

    if (!download?.host || !download?.path || !download?.s || !download?.ts) {
      throw new Error("Некорректный JSON с download-info");
    }

    const hashInput = `XGRlBW9FXlekgbPrRHuSiA${download.path.substr(1)}${download.s}`;
    const hash = await md5Hash(hashInput);

    return `https://${download.host}/get-mp3/${hash}/${download.ts}${download.path}`;
  }
/**
   * Получение дополнительной информации о треке
   * Текст песни, видео и т.д.
   */
  async getSupplement(trackId: string): Promise<TrackSupplement> {
    const response = await this.http.get<{ invocationInfo: any; result: TrackSupplement }>(
      `/tracks/${trackId}/supplement`
    );
    return response.result || {};
  }

  async getSimilar(trackId: string): Promise<SimilarTracks> {
    const response = await this.http.get<{ invocationInfo: any; result: SimilarTracks }>(
      `/tracks/${trackId}/similar`
    );
    return response.result;
  }

  async getLyrics(trackId: string): Promise<any> {
    const response = await this.http.get<{ invocationInfo: any; result: any }>(
      `/tracks/${trackId}/lyrics`
    );
    return response.result;
  }

  async getAllLikedTracks(userId: number, pageSize = 100): Promise<Track[]> {
    const allTracks: Track[] = [];
    let offset = 0;
    let total = 0;

    do {
      const response = await this.http.get<any>(
        `/users/${userId}/likes/tracks?limit=${pageSize}&offset=${offset}`
      );

      const trackEntries = response?.result?.library?.tracks || [];
      total = response?.result?.library?.trackCount || 0;
      if (!trackEntries.length) break;

      const ids = trackEntries.map((track: any) => `${track.id}:${track.albumId}`);
      const tracks = await this.getMany(ids);
      allTracks.push(...tracks);

      offset += trackEntries.length;
    } while (offset < total);

    return allTracks;
  }

  async likeTracks(userId: number, trackIds: string[]): Promise<void> {
    await this.http.post(`/users/${userId}/likes/tracks/add-multiple`, {
      ["track-ids"]: trackIds.join(","),
    });
  }

  async removeLikedTracks(userId: number, trackIds: string[]): Promise<void> {
    await this.http.post(`/users/${userId}/likes/tracks/remove`, {
      ["track-ids"]: trackIds.join(","),
    });
  }

  async getDislikedTracks(userId: number): Promise<string[]> {
    try {
      const response = await this.http.get<any>(`/users/${userId}/dislikes/tracks`);
      const trackIds = response?.result?.trackIds || [];
      return trackIds.map((t: any) => (typeof t === "string" ? t : t.id));
    } catch {
      return [];
    }
  }

/**
   * Получение прямого URL обложки трека
   * @param track Track
   * @param size желаемый размер (например 1000)
   */
  getCoverUrl(track: Track, size = 1000): string | null {
    if (!track.coverUri) return null;

    // Пробуем получить URL из supplement.videos, если есть
    const videoCover = track.supplement?.videos?.[0]?.cover;
    if (videoCover) {
      return videoCover.replace("%%", `${size}x${size}`);
    }

    // Если supplement нет, используем стандартный coverUri
    // Пример корректного URL: https://storage.mds.yandex.net/get-music-cover/<coverUri>/<size>x<size>
    return `https://storage.mds.yandex.net/get-music-cover/${track.coverUri}/${size}x${size}`;
  }

}
