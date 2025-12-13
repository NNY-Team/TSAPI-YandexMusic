// src/api/Radio.ts

import { BaseApi } from "./BaseApi.ts";
import { AuthManager } from "../auth/AuthManager.ts";
import { Track } from "../models/Track.ts";

export interface RadioStation {
  id: {
    type: string;
    tag: string;
  };
  name: string;
  description?: string;
  image?: string;
  restrictions?: Record<string, any>;
  icon?: {
    backgroundColor?: string;
    imageUrl?: string;
  };
  mtsIcon?: {
    backgroundColor?: string;
    imageUrl?: string;
  };
  fullImageUrl?: string;
  mtsFullImageUrl?: string;
  idForFrom?: string;
}

export interface SequenceItem {
  type: string;
  track: Track;
  liked: boolean;
  trackParameters?: {
    bpm?: number;
    hue?: number;
    energy?: number;
  };
}

export interface RadioSession {
  id: {
    type: string;
    tag: string;
  };
  sequence: SequenceItem[];
  batchId: string;
  pumpkin?: boolean;
  radioSessionId?: string;
}

export interface RadioFeedback {
  type: 'radioStarted' | 'trackStarted' | 'trackFinished' | 'skip';
  timestamp?: string;
  from?: string;
  trackId?: string;
  totalPlayedSeconds?: number;
}

export class RadioApi extends BaseApi {
  constructor(authManager: AuthManager) {
    super(authManager);
  }

  async getStations(): Promise<RadioStation[]> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: Array<{ station: RadioStation }>;
    }>(`/rotor/stations/list`);
    // API возвращает массив объектов с полем 'station'
    return response.result.map(item => item.station);
  }

  async getStationTracks(stationId: string, settings2: boolean = true): Promise<RadioSession> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: RadioSession;
    }>(`/rotor/station/${stationId}/tracks`, {
      settings2,
    });
    return response.result;
  }

  async sendFeedback(
    stationId: string,
    feedback: RadioFeedback,
    batchId?: string
  ): Promise<void> {
    const params: Record<string, any> = {};
    if (batchId && feedback.type !== 'radioStarted') {
      params['batch-id'] = batchId;
    }

    const body = {
      ...feedback,
      timestamp: feedback.timestamp || new Date().toISOString(),
    };

    await this.http.post(`/rotor/station/${stationId}/feedback`, body, params);
  }

  async skipTrack(
    stationId: string,
    trackId: string,
    batchId: string,
    totalPlayedSeconds: number
  ): Promise<void> {
    return this.sendFeedback(
      stationId,
      {
        type: 'skip',
        trackId,
        totalPlayedSeconds,
      },
      batchId
    );
  }

  async getStationInfo(stationId: string): Promise<any> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: any[];
    }>(`/rotor/station/${stationId}/info`);
    return response.result;
  }

  /**
   * Получить статус радио аккаунта пользователя
   * GET /rotor/account/status
   * 
   * @returns Статус радио аккаунта с дополнительными полями
   * 
   * @example
   * ```typescript
   * const status = await client.radio.getAccountStatus();
   * console.log(`Has plus: ${status.subscription?.hasPlus}`);
   * ```
   */
  async getAccountStatus(): Promise<any> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: any;
    }>(`/rotor/account/status`);
    return response.result;
  }
}

