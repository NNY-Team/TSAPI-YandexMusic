"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/electron/index.js
var require_electron = __commonJS({
  "node_modules/electron/index.js"(exports2, module2) {
    "use strict";
    var fs2 = require("fs");
    var path2 = require("path");
    var pathFile = path2.join(__dirname, "path.txt");
    function getElectronPath() {
      let executablePath;
      if (fs2.existsSync(pathFile)) {
        executablePath = fs2.readFileSync(pathFile, "utf-8");
      }
      if (process.env.ELECTRON_OVERRIDE_DIST_PATH) {
        return path2.join(process.env.ELECTRON_OVERRIDE_DIST_PATH, executablePath || "electron");
      }
      if (executablePath) {
        return path2.join(__dirname, "dist", executablePath);
      } else {
        throw new Error("Electron failed to install correctly, please delete node_modules/electron and try installing again");
      }
    }
    module2.exports = getElectronPath();
  }
});

// src/index.ts
var index_exports = {};
__export(index_exports, {
  AccountApi: () => AccountApi,
  AlbumsApi: () => AlbumsApi,
  ArtistsApi: () => ArtistsApi,
  AuthManager: () => AuthManager,
  AuthState: () => AuthState,
  BaseApi: () => BaseApi,
  DEFAULT_DEVICE_HEADER: () => DEFAULT_DEVICE_HEADER,
  ElectronOAuth: () => ElectronOAuth,
  FeedApi: () => FeedApi,
  HttpClient: () => HttpClient,
  LandingApi: () => LandingApi,
  NonMusicApi: () => NonMusicApi,
  PlaylistsApi: () => PlaylistsApi,
  QueuesApi: () => QueuesApi,
  RadioApi: () => RadioApi,
  SearchApi: () => SearchApi,
  TagsApi: () => TagsApi,
  TokenStorage: () => TokenStorage,
  TracksApi: () => TracksApi,
  UsersApi: () => UsersApi,
  YandexMusicClient: () => YandexMusicClient,
  getAllCoverSizes: () => getAllCoverSizes,
  getCoverUrl: () => getCoverUrl,
  hasCover: () => hasCover
});
module.exports = __toCommonJS(index_exports);

// src/http/client.ts
var import_axios = __toESM(require("axios"));
var CORS_PROXIES = [
  "https://api.allorigins.win/raw?url=",
  // Alternative CORS proxy
  "https://cors-anywhere.herokuapp.com/"
  // Traditional CORS proxy
];
var HttpClient = class {
  constructor(authManager, useCorsProxy = true) {
    this.authManager = authManager;
    this.useCorsProxy = useCorsProxy && typeof window !== "undefined";
    const baseURL = this.useCorsProxy ? CORS_PROXIES[0] + encodeURIComponent("https://api.music.yandex.net") : "https://api.music.yandex.net";
    this.client = import_axios.default.create({
      baseURL,
      timeout: 1e4
    });
    this.client.interceptors.request.use(async (config) => {
      const token = await authManager.getToken();
      if (token) {
        config.headers.Authorization = `OAuth ${token}`;
      }
      return config;
    });
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (this.useCorsProxy && error.response?.status === 503) {
          console.warn("Primary CORS proxy failed, trying alternative...");
          const newBaseURL = CORS_PROXIES[1] + encodeURIComponent("https://api.music.yandex.net");
          this.client.defaults.baseURL = newBaseURL;
        }
        throw error;
      }
    );
  }
  async get(url, params) {
    const response = await this.client.get(url, { params });
    return response.data;
  }
  async post(url, data, params) {
    const response = await this.client.post(url, data, { params });
    return response.data;
  }
  async put(url, data) {
    const response = await this.client.put(url, data);
    return response.data;
  }
  async delete(url) {
    const response = await this.client.delete(url);
    return response.data;
  }
};

// src/api/BaseApi.ts
var BaseApi = class {
  constructor(authManager) {
    this.auth = authManager;
    const isBrowser2 = typeof window !== "undefined";
    this.http = new HttpClient(authManager, isBrowser2);
  }
};

// src/api/Account.ts
var AccountApi = class extends BaseApi {
  constructor(authManager) {
    super(authManager);
  }
  async getStatus() {
    const response = await this.http.get(`/account/status`);
    return response.result;
  }
  async getSettings() {
    const response = await this.http.get(`/account/settings`);
    return response.result;
  }
  async updateSettings(settings) {
    const response = await this.http.post(`/account/settings`, this.encodeFormData(settings));
    return response.result;
  }
  async getExperiments() {
    const response = await this.http.get(`/account/experiments`);
    return response.result;
  }
  encodeFormData(data) {
    return Object.entries(data).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
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
  async consumePromoCode(code, language) {
    const response = await this.http.post(`/account/consume-promo-code`, {
      code,
      language
    });
    return response.result;
  }
};

// src/api/Users.ts
var UsersApi = class extends BaseApi {
  constructor(authManager) {
    super(authManager);
  }
  async getInfo(userId) {
    const response = await this.http.get(`/users/${userId}`);
    return response.result;
  }
};

// src/utils/hashUtils.ts
async function md5Hash(data) {
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const buffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    } catch (err) {
      console.error("Browser MD5 error:", err);
      return simpleHash(data);
    }
  }
  try {
    const crypto2 = require("crypto");
    return crypto2.createHash("md5").update(data).digest("hex");
  } catch (err) {
    console.error("Node.js MD5 error:", err);
    return simpleHash(data);
  }
}
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

// src/api/Tracks.ts
var TracksApi = class extends BaseApi {
  constructor(authManager) {
    super(authManager);
  }
  async get(trackId) {
    const tracks = await this.getMany([trackId]);
    return tracks[0] || {};
  }
  async getMany(trackIds) {
    const formData = new URLSearchParams();
    trackIds.forEach((id) => formData.append("track-ids", id));
    const response = await this.http.post(
      `/tracks`,
      formData
    );
    return response.result || [];
  }
  async getDownloadInfo(trackId) {
    const response = await this.http.get(
      `/tracks/${trackId}/download-info`
    );
    return response.result;
  }
  async getDownloadInfoRaw(trackId) {
    return this.http.get(`/tracks/${trackId}/download-info`);
  }
  /**
   * Получение прямой ссылки на mp3 трек
   * Выбирает нужный формат по битрейту или первый доступный
   */
  async getTrackURL(trackId, preferredBitrate = 320) {
    const raw = await this.getDownloadInfoRaw(trackId);
    if (!raw?.result?.length) throw new Error("Download info \u043E\u0442\u0441\u0443\u0442\u0441\u0442\u0432\u0443\u0435\u0442");
    const info = raw.result.find((i) => i.bitrateInKbps === preferredBitrate) || raw.result[0];
    const downloadJsonRes = await this.http.get(`${info.downloadInfoUrl}&format=json`);
    const download = downloadJsonRes;
    if (!download?.host || !download?.path || !download?.s || !download?.ts) {
      throw new Error("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 JSON \u0441 download-info");
    }
    const hashInput = `XGRlBW9FXlekgbPrRHuSiA${download.path.substr(1)}${download.s}`;
    const hash = await md5Hash(hashInput);
    return `https://${download.host}/get-mp3/${hash}/${download.ts}${download.path}`;
  }
  /**
     * Получение дополнительной информации о треке
     * Текст песни, видео и т.д.
     */
  async getSupplement(trackId) {
    const response = await this.http.get(
      `/tracks/${trackId}/supplement`
    );
    return response.result || {};
  }
  async getSimilar(trackId) {
    const response = await this.http.get(
      `/tracks/${trackId}/similar`
    );
    return response.result;
  }
  async getLyrics(trackId) {
    const response = await this.http.get(
      `/tracks/${trackId}/lyrics`
    );
    return response.result;
  }
  async getAllLikedTracks(userId, pageSize = 100) {
    const allTracks = [];
    let offset = 0;
    let total = 0;
    do {
      const response = await this.http.get(
        `/users/${userId}/likes/tracks?limit=${pageSize}&offset=${offset}`
      );
      const trackEntries = response?.result?.library?.tracks || [];
      total = response?.result?.library?.trackCount || 0;
      if (!trackEntries.length) break;
      const ids = trackEntries.map((track) => `${track.id}:${track.albumId}`);
      const tracks = await this.getMany(ids);
      allTracks.push(...tracks);
      offset += trackEntries.length;
    } while (offset < total);
    return allTracks;
  }
  async likeTracks(userId, trackIds) {
    await this.http.post(`/users/${userId}/likes/tracks/add-multiple`, {
      ["track-ids"]: trackIds.join(",")
    });
  }
  async removeLikedTracks(userId, trackIds) {
    await this.http.post(`/users/${userId}/likes/tracks/remove`, {
      ["track-ids"]: trackIds.join(",")
    });
  }
  async getDislikedTracks(userId) {
    try {
      const response = await this.http.get(`/users/${userId}/dislikes/tracks`);
      const trackIds = response?.result?.trackIds || [];
      return trackIds.map((t) => typeof t === "string" ? t : t.id);
    } catch {
      return [];
    }
  }
  /**
     * Получение прямого URL обложки трека
     * @param track Track
     * @param size желаемый размер (например 1000)
     */
  getCoverUrl(track, size = 1e3) {
    if (!track.coverUri) return null;
    const videoCover = track.supplement?.videos?.[0]?.cover;
    if (videoCover) {
      return videoCover.replace("%%", `${size}x${size}`);
    }
    return `https://storage.mds.yandex.net/get-music-cover/${track.coverUri}/${size}x${size}`;
  }
};

// src/api/Playlists.ts
var PlaylistsApi = class extends BaseApi {
  constructor(authManager) {
    super(authManager);
  }
  async get(userId, playlistKind) {
    const response = await this.http.get(`/users/${userId}/playlists/${playlistKind}`);
    return response.result;
  }
  async getList(userId) {
    const response = await this.http.get(`/users/${userId}/playlists/list`);
    return response.result;
  }
  async getByIds(playlistIds) {
    const playlistIdStrings = playlistIds.map((p) => `${p.uid}:${p.kind}`);
    const response = await this.http.post(`/playlists/list`, { playlistIds: playlistIdStrings.join(",") });
    return response.result;
  }
  async create(userId, title, visibility = "private") {
    const response = await this.http.post(`/users/${userId}/playlists/create`, { title, visibility });
    return response.result;
  }
  async rename(userId, playlistKind, newName) {
    const response = await this.http.post(`/users/${userId}/playlists/${playlistKind}/name`, { value: newName });
    return response.result;
  }
  async delete(userId, playlistKind) {
    await this.http.post(`/users/${userId}/playlists/${playlistKind}/delete`, {});
  }
  async setVisibility(userId, playlistKind, visibility) {
    const response = await this.http.post(`/users/${userId}/playlists/${playlistKind}/visibility`, { value: visibility });
    return response.result;
  }
  async addTracks(userId, playlistKind, tracks, at = 0) {
    const diff = JSON.stringify({
      op: "insert",
      at,
      tracks
    });
    const response = await this.http.post(`/users/${userId}/playlists/${playlistKind}/change-relative`, {
      diff,
      revision: "0"
    });
    return response.result;
  }
  async removeTracks(userId, playlistKind, tracks, from = 0, to = 1) {
    const diff = JSON.stringify({
      op: "delete",
      from,
      to,
      tracks
    });
    const response = await this.http.post(`/users/${userId}/playlists/${playlistKind}/change-relative`, {
      diff,
      revision: "0"
    });
    return response.result;
  }
  async getRecommendations(userId, playlistKind) {
    const response = await this.http.get(`/users/${userId}/playlists/${playlistKind}/recommendations`);
    return response.result;
  }
};

// src/api/Albums.ts
var AlbumsApi = class extends BaseApi {
  constructor(authManager) {
    super(authManager);
  }
  async get(albumId) {
    const response = await this.http.get(`/albums/${albumId}/`);
    return response.result;
  }
  async getWithTracks(albumId) {
    const response = await this.http.get(`/albums/${albumId}/with-tracks`);
    return response.result;
  }
  async getMany(albumIds) {
    const ids = albumIds.join(",");
    const response = await this.http.post(`/albums`, { ["album-ids"]: ids });
    return response.result;
  }
};

// src/api/Artists.ts
var ArtistsApi = class extends BaseApi {
  constructor(authManager) {
    super(authManager);
  }
  async getPopularTracks(artistId) {
    const response = await this.http.get(`/artists/${artistId}/track-ids-by-rating`);
    return {
      artist: response.result.artist,
      tracks: []
      // Нужно будет вызвать getTracks
    };
  }
  async getInfo(artistId) {
    const response = await this.http.get(`/artists/${artistId}`);
    return response.result;
  }
  async getTracks(artistId, page = 0, pageSize = 20) {
    const response = await this.http.get(`/artists/${artistId}/tracks`, { page, ["page-size"]: pageSize });
    return response.result;
  }
  async getAlbums(artistId, page = 0, pageSize = 20, sortBy = "rating") {
    const response = await this.http.get(`/artists/${artistId}/direct-albums`, {
      page,
      ["page-size"]: pageSize,
      ["sort-by"]: sortBy
    });
    return response;
  }
  /**
   * Получить краткую информацию об артисте
   * GET /artists/{artistId}/brief-info
   * 
   * @param artistId - ID артиста
   * @returns Краткая информация об артисте
   * 
   * @example
   * ```typescript
   * const info = await client.artists.getBriefInfo('artist-id');
   * console.log(`Основное: ${info.main}`);
   * console.log(`Похожие артисты: ${info.similarArtists?.length}`);
   * ```
   */
  async getBriefInfo(artistId) {
    const response = await this.http.get(`/artists/${artistId}/brief-info`);
    return response.result;
  }
};

// src/api/Radio.ts
var RadioApi = class extends BaseApi {
  constructor(authManager) {
    super(authManager);
  }
  async getStations() {
    const response = await this.http.get(`/rotor/stations/list`);
    return response.result.map((item) => item.station);
  }
  async getStationTracks(stationId, settings2 = true) {
    const response = await this.http.get(`/rotor/station/${stationId}/tracks`, {
      settings2
    });
    return response.result;
  }
  async sendFeedback(stationId, feedback, batchId) {
    const params = {};
    if (batchId && feedback.type !== "radioStarted") {
      params["batch-id"] = batchId;
    }
    const body = {
      ...feedback,
      timestamp: feedback.timestamp || (/* @__PURE__ */ new Date()).toISOString()
    };
    await this.http.post(`/rotor/station/${stationId}/feedback`, body, params);
  }
  async skipTrack(stationId, trackId, batchId, totalPlayedSeconds) {
    return this.sendFeedback(
      stationId,
      {
        type: "skip",
        trackId,
        totalPlayedSeconds
      },
      batchId
    );
  }
  async getStationInfo(stationId) {
    const response = await this.http.get(`/rotor/station/${stationId}/info`);
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
  async getAccountStatus() {
    const response = await this.http.get(`/rotor/account/status`);
    return response.result;
  }
};

// src/api/Search.ts
var SearchApi = class extends BaseApi {
  constructor(authManager) {
    super(authManager);
  }
  async search(text, type = "all", page = 0, nocorrect = false) {
    const response = await this.http.get(`/search`, {
      text,
      type,
      page,
      nococrrect: nocorrect
    });
    return response.result;
  }
  async searchTracks(text, page = 0) {
    const result = await this.search(text, "track", page);
    return result.tracks || { total: 0, perPage: 0, results: [] };
  }
  async searchAlbums(text, page = 0) {
    const result = await this.search(text, "album", page);
    return result.albums || { total: 0, perPage: 0, results: [] };
  }
  async searchArtists(text, page = 0) {
    const result = await this.search(text, "artist", page);
    return result.artists || { total: 0, perPage: 0, results: [] };
  }
  async searchPlaylists(text, page = 0) {
    const result = await this.search(text, "playlist", page);
    return result.playlists || { total: 0, perPage: 0, results: [] };
  }
  async suggest(part) {
    const response = await this.http.get(`/search/suggest`, { part });
    return response.result;
  }
};

// src/api/Landing.ts
var LandingApi = class extends BaseApi {
  constructor(authManager) {
    super(authManager);
  }
  /**
   * Получить блоки главной страницы
   * GET /landing3
   * 
   * @param blockTypes - Типы блоков (например: "playlist_of_the_day,chart_week")
   * @returns Объект с блоками главной страницы
   */
  async getLanding(blockTypes) {
    const response = await this.http.get(`/landing3`, {
      blocks: blockTypes?.join(",")
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
  async getLandingBlock(landingBlock) {
    const response = await this.http.get(`/landing3/${landingBlock}`);
    return response.result;
  }
  /**
   * Получить новые релизы
   * GET /landing3/new-releases
   * 
   * @returns Блок с новыми релизами
   */
  async getNewReleases() {
    const response = await this.http.get(`/landing3/new-releases`);
    return response.result;
  }
  /**
   * Получить подкасты
   * GET /landing3/podcasts
   * 
   * @returns Блок с подкастами
   */
  async getPodcasts() {
    const response = await this.http.get(`/landing3/podcasts`);
    return response.result;
  }
  /**
   * Получить новые плейлисты
   * GET /landing3/new-playlists
   * 
   * @returns Блок с новыми плейлистами
   */
  async getNewPlaylists() {
    const response = await this.http.get(`/landing3/new-playlists`);
    return response.result;
  }
  /**
   * Получить чарты
   * GET /landing3/chart/{chartType}
   * 
   * @param chartType - Тип чарта (например: "world", "russia", "mosaic")
   * @returns Блок с чартом
   */
  async getChart(chartType = "world") {
    const response = await this.http.get(`/landing3/chart/${chartType}`);
    return response.result;
  }
  /**
   * Получить плейлист дня
   * GET /landing3 (blocks=playlist_of_the_day)
   * 
   * @returns Плейлист дня
   */
  async getPlaylistOfTheDay() {
    return this.getLanding(["playlist_of_the_day"]);
  }
  /**
   * Получить чарт недели
   * GET /landing3 (blocks=chart_week)
   * 
   * @returns Чарт недели
   */
  async getChartWeek() {
    return this.getLanding(["chart_week"]);
  }
  /**
   * Получить чарт месяца
   * GET /landing3 (blocks=chart_month)
   * 
   * @returns Чарт месяца
   */
  async getChartMonth() {
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
  async getGenres() {
    const response = await this.http.get(`/genres`);
    return response.result;
  }
};

// src/api/Feed.ts
var FeedApi = class extends BaseApi {
  constructor(authManager) {
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
  async getFeed() {
    const response = await this.http.get(`/feed`);
    return response.result;
  }
};

// src/api/Queues.ts
var DEFAULT_DEVICE_HEADER = "os=unknown; os_version=unknown; manufacturer=unknown; model=unknown; clid=; device_id=unknown; uuid=unknown";
var QueuesApi = class extends BaseApi {
  constructor(authManager) {
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
  async getQueues(deviceHeader) {
    const response = await this.http.get(`/queues`);
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
  async getQueue(queueId) {
    const response = await this.http.get(`/queues/${queueId}`);
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
  async updatePosition(queueId, currentIndex, isInteractive = true) {
    const response = await this.http.post(
      `/queues/${queueId}/update-position`,
      {},
      {
        currentIndex: currentIndex.toString(),
        IsInteractive: isInteractive.toString()
      }
    );
    return response.result;
  }
};

// src/api/Tags.ts
var TagsApi = class extends BaseApi {
  constructor(authManager) {
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
  async getPlaylistsByTag(tagId) {
    const response = await this.http.get(`/tags/${tagId}/playlist-ids`);
    return response.result;
  }
};

// src/api/NonMusic.ts
var NonMusicApi = class extends BaseApi {
  constructor(authManager) {
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
  async getBooksAndPodcasts() {
    const response = await this.http.get(`/non-music/calague`);
    return response.result;
  }
};

// src/auth/TokenStorage.ts
var isNode = typeof process !== "undefined" && process.versions && process.versions.node;
var isBrowser = typeof window !== "undefined";
var fs = null;
var path = null;
var app = null;
if (isNode) {
  try {
    fs = require("fs");
  } catch (e) {
  }
  try {
    path = require("path");
  } catch (e) {
  }
}
try {
  app = require_electron().app;
} catch (e) {
}
var TokenStorage = class {
  constructor(storagePath) {
    this.storageKey = "yandex_music_token";
    if (isBrowser && (!isNode || !fs || !path)) {
      this.filePath = null;
      return;
    }
    if (!isNode || !fs || !path) {
      this.filePath = null;
      return;
    }
    let dir;
    if (storagePath) {
      dir = storagePath;
    } else if (app) {
      dir = app.getPath("userData");
    } else {
      const home = process.env.HOME || process.env.USERPROFILE || "/tmp";
      dir = home;
    }
    try {
      this.filePath = path.join(dir, "yandex-token.json");
    } catch {
      this.filePath = null;
    }
  }
  async saveToken(token) {
    if (!this.filePath) {
      if (isBrowser) {
        try {
          localStorage.setItem(this.storageKey, token);
        } catch {
          console.warn("Failed to save token to localStorage");
        }
      }
      return;
    }
    if (!fs || !path) {
      return;
    }
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify({ token }), "utf8");
    } catch (err) {
    }
  }
  async getToken() {
    if (!this.filePath) {
      if (isBrowser) {
        try {
          return localStorage.getItem(this.storageKey);
        } catch {
          return null;
        }
      }
      return null;
    }
    if (!fs) {
      return null;
    }
    try {
      return JSON.parse(fs.readFileSync(this.filePath, "utf8")).token;
    } catch {
      return null;
    }
  }
  async clearToken() {
    if (!this.filePath) {
      if (isBrowser) {
        try {
          localStorage.removeItem(this.storageKey);
        } catch {
        }
      }
      return;
    }
    if (!fs) {
      return;
    }
    try {
      fs.unlinkSync(this.filePath);
    } catch {
    }
  }
};

// src/auth/ElectronOAuth.ts
var import_electron = __toESM(require_electron());
var ElectronOAuth = class {
  constructor() {
    this.oauthWindow = null;
    this.OAUTH_URL = `https://oauth.yandex.ru/authorize?response_type=token&client_id=23cabbbdc6cd418abb4b39c32c41195d`;
    this.URL_WITH_TOKEN_REGEX = /#access_token=([^&]+)/;
  }
  async authorize() {
    return new Promise((resolve, reject) => {
      this.oauthWindow = new import_electron.BrowserWindow({
        width: 600,
        height: 700,
        modal: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true
        }
      });
      this.oauthWindow.loadURL(this.OAUTH_URL);
      this.oauthWindow.webContents.on("did-navigate", (_, url) => {
        const match = url.match(this.URL_WITH_TOKEN_REGEX);
        if (match) {
          const token = match[1];
          this.clearCookies();
          this.oauthWindow?.close();
          resolve(token);
        }
      });
      this.oauthWindow.on("closed", () => {
        reject(new Error("OAuth closed"));
      });
    });
  }
  async clearCookies() {
    const ses = import_electron.session.defaultSession;
    const cookies = await ses.cookies.get({});
    for (const c of cookies) {
      ses.cookies.remove(c.domain || "", c.path || "/");
    }
  }
};

// src/auth/AuthManager.ts
var AuthState = /* @__PURE__ */ ((AuthState2) => {
  AuthState2["UNAUTHORIZED"] = "UNAUTHORIZED";
  AuthState2["AUTHORIZED"] = "AUTHORIZED";
  return AuthState2;
})(AuthState || {});
var AuthManager = class {
  constructor(options = {}) {
    this.state = "UNAUTHORIZED" /* UNAUTHORIZED */;
    this.oauth = options.oauth || new ElectronOAuth();
    this.storage = options.storage || new TokenStorage(options.storagePath);
    this.currentToken = options.token || null;
    if (this.currentToken) {
      this.state = "AUTHORIZED" /* AUTHORIZED */;
    }
  }
  /**
   * Проверяет, есть ли токен (и не просрочен ли).
   */
  async getToken() {
    if (this.currentToken) return this.currentToken;
    const token = await this.storage.getToken();
    return token ?? null;
  }
  /**
   * Принудительно начинает OAuth авторизацию через Electron BrowserWindow.
   */
  async login() {
    const token = await this.oauth.authorize();
    this.currentToken = token;
    this.state = "AUTHORIZED" /* AUTHORIZED */;
    await this.storage.saveToken(token);
    return token;
  }
  /**
   * Возвращает токен, если он уже сохранён, иначе запускает OAuth авторизацию.
   */
  async requireToken() {
    const existing = await this.getToken();
    if (existing) {
      this.state = "AUTHORIZED" /* AUTHORIZED */;
      return existing;
    }
    const newToken = await this.login();
    return newToken;
  }
  /**
   * Удаляет токен (logout).
   */
  async logout() {
    this.currentToken = null;
    this.state = "UNAUTHORIZED" /* UNAUTHORIZED */;
    await this.storage.clearToken();
  }
};

// src/client.ts
var YandexMusicClient = class {
  constructor(options = {}) {
    this.auth = new AuthManager({
      token: options.token,
      storagePath: options.storagePath
    });
    this.account = new AccountApi(this.auth);
    this.users = new UsersApi(this.auth);
    this.tracks = new TracksApi(this.auth);
    this.playlists = new PlaylistsApi(this.auth);
    this.albums = new AlbumsApi(this.auth);
    this.artists = new ArtistsApi(this.auth);
    this.radio = new RadioApi(this.auth);
    this.search = new SearchApi(this.auth);
    this.landing = new LandingApi(this.auth);
    this.feed = new FeedApi(this.auth);
    this.queues = new QueuesApi(this.auth);
    this.tags = new TagsApi(this.auth);
    this.nonMusic = new NonMusicApi(this.auth);
  }
  get isAuthorized() {
    return this.auth.state === "AUTHORIZED" /* AUTHORIZED */;
  }
  async login() {
    return this.auth.login();
  }
  async logout() {
    return this.auth.logout();
  }
};

// src/utils/coverUtils.ts
function getCoverUrl(coverUri, size = 200) {
  if (!coverUri) {
    return null;
  }
  const urlTemplate = coverUri.replace("%%", `${size}x${size}`);
  if (urlTemplate.startsWith("http://") || urlTemplate.startsWith("https://")) {
    return urlTemplate;
  }
  return `https://${urlTemplate}`;
}
function hasCover(coverUri) {
  return !!coverUri && coverUri.length > 0;
}
function getAllCoverSizes(coverUri) {
  return {
    small: getCoverUrl(coverUri, 100),
    medium: getCoverUrl(coverUri, 200),
    large: getCoverUrl(coverUri, 300),
    xlarge: getCoverUrl(coverUri, 400)
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  AccountApi,
  AlbumsApi,
  ArtistsApi,
  AuthManager,
  AuthState,
  BaseApi,
  DEFAULT_DEVICE_HEADER,
  ElectronOAuth,
  FeedApi,
  HttpClient,
  LandingApi,
  NonMusicApi,
  PlaylistsApi,
  QueuesApi,
  RadioApi,
  SearchApi,
  TagsApi,
  TokenStorage,
  TracksApi,
  UsersApi,
  YandexMusicClient,
  getAllCoverSizes,
  getCoverUrl,
  hasCover
});
