// src/api/Queues.ts

import { BaseApi } from "./BaseApi.ts";
import { AuthManager } from "../auth/AuthManager.ts";
import { Track } from "../models/Track.ts";

export interface QueueItem {
  id: string;
  currentIndex?: number;
  tracks: Track[];
  updated?: string;
  [key: string]: any;
}

export interface QueuesResult {
  queues: QueueItem[];
  [key: string]: any;
}

export interface UpdateQueueResult {
  currentIndex?: number;
  status?: string;
  [key: string]: any;
}

/**
 * Параметр X-Yandex-Music-Device
 * 
 * Используется для идентификации устройства
 * Пример: "os=Linux; os_version=5.10; manufacturer=Linux; model=Web; clid=; device_id=123; uuid=abc-def"
 */
export const DEFAULT_DEVICE_HEADER = "os=unknown; os_version=unknown; manufacturer=unknown; model=unknown; clid=; device_id=unknown; uuid=unknown";

export class QueuesApi extends BaseApi {
  constructor(authManager: AuthManager) {
    super(authManager);
  }

  /**
   * Получить все очереди треков (для синхронизации между устройствами)
   * GET /queues
   * 
   * Используется для получения очередей со всех устройств пользователя
   * и синхронизации текущего проигрываемого трека между ними.
   * 
   * @param deviceHeader - X-Yandex-Music-Device header (опционально)
   * @returns Результат со всеми очередями
   * 
   * @example
   * ```typescript
   * const queues = await client.queues.getQueues();
   * console.log(`Очередей найдено: ${queues.queues.length}`);
   * queues.queues.forEach(queue => {
   *   console.log(`Queue ${queue.id}: ${queue.tracks.length} треков`);
   * });
   * ```
   */
  async getQueues(deviceHeader?: string): Promise<QueuesResult> {
    // TODO: Передача X-Yandex-Music-Device header требует расширения HttpClient
    // Пока используем основной эндпоинт без указания header
    const response = await this.http.get<{
      invocationInfo: any;
      result: QueuesResult;
    }>(`/queues`);
    
    return response.result;
  }

  /**
   * Получить конкретную очередь треков по ID
   * GET /queues/{queueId}
   * 
   * @param queueId - Идентификатор очереди
   * @returns Объект очереди с треками
   * 
   * @example
   * ```typescript
   * const queue = await client.queues.getQueue('queue-123');
   * console.log(`Текущий трек: ${queue.currentIndex}`);
   * console.log(`Всего треков: ${queue.tracks.length}`);
   * ```
   */
  async getQueue(queueId: string): Promise<QueueItem> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: QueueItem;
    }>(`/queues/${queueId}`);
    
    return response.result;
  }

  /**
   * Обновить текущую позицию в очереди
   * POST /queues/{queueId}/update-position
   * 
   * Используется для синхронизации позиции проигрывания между устройствами
   * 
   * @param queueId - Идентификатор очереди
   * @param currentIndex - Новый индекс трека в очереди (0-based)
   * @param isInteractive - Пользовательское взаимодействие ли это (true/false)
   * @returns Результат обновления
   * 
   * @example
   * ```typescript
   * const result = await client.queues.updatePosition('queue-123', 5, true);
   * console.log(`Позиция обновлена на: ${result.currentIndex}`);
   * ```
   */
  async updatePosition(
    queueId: string,
    currentIndex: number,
    isInteractive: boolean = true
  ): Promise<UpdateQueueResult> {
    const response = await this.http.post<{
      invocationInfo: any;
      result: UpdateQueueResult;
    }>(
      `/queues/${queueId}/update-position`,
      {},
      {
        currentIndex: currentIndex.toString(),
        IsInteractive: isInteractive.toString(),
      }
    );
    
    return response.result;
  }
}
