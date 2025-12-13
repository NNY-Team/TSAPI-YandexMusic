import { BrowserWindow } from 'electron';

declare class TokenStorage {
    private filePath;
    private storageKey;
    constructor(storagePath?: string);
    saveToken(token: string): Promise<void>;
    getToken(): Promise<string | null>;
    clearToken(): Promise<void>;
}

declare class ElectronOAuth {
    oauthWindow: BrowserWindow | null;
    OAUTH_URL: string;
    URL_WITH_TOKEN_REGEX: RegExp;
    authorize(): Promise<string>;
    clearCookies(): Promise<void>;
}

declare enum AuthState {
    UNAUTHORIZED = "UNAUTHORIZED",
    AUTHORIZED = "AUTHORIZED"
}
interface AuthManagerOptions {
    oauth?: ElectronOAuth;
    storage?: TokenStorage;
    token?: string;
    storagePath?: string;
}
declare class AuthManager {
    private oauth;
    private storage;
    private currentToken;
    state: AuthState;
    constructor(options?: AuthManagerOptions);
    /**
     * Проверяет, есть ли токен (и не просрочен ли).
     */
    getToken(): Promise<string | null>;
    /**
     * Принудительно начинает OAuth авторизацию через Electron BrowserWindow.
     */
    login(): Promise<string>;
    /**
     * Возвращает токен, если он уже сохранён, иначе запускает OAuth авторизацию.
     */
    requireToken(): Promise<string>;
    /**
     * Удаляет токен (logout).
     */
    logout(): Promise<void>;
}

declare class HttpClient {
    private client;
    private authManager;
    private useCorsProxy;
    constructor(authManager: AuthManager, useCorsProxy?: boolean);
    get<T>(url: string, params?: Record<string, any>): Promise<T>;
    post<T>(url: string, data?: any, params?: Record<string, any>): Promise<T>;
    put<T>(url: string, data?: any): Promise<T>;
    delete<T>(url: string): Promise<T>;
}

declare class BaseApi {
    protected http: HttpClient;
    protected auth: AuthManager;
    constructor(authManager: AuthManager);
}

interface AccountStatus {
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
interface UserSettings {
    theme?: string;
    volumePercents?: number;
    adsDisabled?: boolean;
    [key: string]: any;
}
interface Experiments {
    [key: string]: any;
}
declare class AccountApi extends BaseApi {
    constructor(authManager: AuthManager);
    getStatus(): Promise<AccountStatus>;
    getSettings(): Promise<UserSettings>;
    updateSettings(settings: UserSettings): Promise<UserSettings | null>;
    getExperiments(): Promise<Experiments>;
    private encodeFormData;
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
    consumePromoCode(code: string, language?: string): Promise<any>;
}

interface UserInfo {
    uid: number;
    login: string;
    name?: string;
    sex?: string;
    homelocation?: string;
    verified: boolean;
}
declare class UsersApi extends BaseApi {
    constructor(authManager: AuthManager);
    getInfo(userId: string): Promise<UserInfo>;
}

interface Artist {
    id: string;
    name: string;
    cover?: {
        type: string;
        uri: string;
        dir: string;
        sizes?: Array<{
            url: string;
            width: number;
            height: number;
        }>;
    };
    coverUri?: string;
    genres?: string[];
    counts?: {
        tracks?: number;
        directAlbums?: number;
        alsoAlbums?: number;
        alsoTracks?: number;
    };
    ticketsAvailable?: boolean;
    links?: Array<{
        title: string;
        href: string;
    }>;
    ratings?: {
        week?: number;
        month?: number;
    };
    description?: string;
    descriptionFormatted?: string;
}

interface Album {
    id: string;
    title: string;
    type?: 'album' | 'compilation' | 'ep';
    metaType?: string;
    coverUri?: string;
    ogImage?: string;
    genre?: string;
    year?: number;
    releaseDate?: string;
    artists?: Artist[];
    trackCount?: number;
    description?: string;
    descriptionFormatted?: string;
    ratingPercent?: number;
    likesCount?: number;
}

interface Track {
    id: string;
    realId?: string;
    title: string;
    durationMs: number;
    fileSize?: number;
    available: boolean;
    availableForPremiumUsers: boolean;
    availableFullWithoutPermission: boolean;
    coverUri?: string;
    ogImage?: string;
    lyricsAvailable?: boolean;
    type?: string;
    major?: {
        id: number;
        name: string;
    };
    normalization?: {
        gain: number;
        peak: number;
    };
    previewDurationMs?: number;
    rememberPosition?: boolean;
    storageDir?: string;
    artists?: Artist[];
    albums?: Album[];
    contentWarning?: string;
    explicitLyrics?: boolean;
    availableAsRbt?: boolean;
    remoteLink?: boolean;
    diskNumber?: number;
    trackNumber?: number;
    supplement?: TrackSupplement;
}

interface DownloadInfo {
    downloadInfoUrl: string;
    codec: string;
    gain: boolean;
    preview: boolean;
    diffStereoEnabled: boolean;
    bitrateInKbps: number;
}
interface TrackSupplement {
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
interface SimilarTracks {
    track: Track;
    similars: Track[];
}
declare class TracksApi extends BaseApi {
    constructor(authManager: AuthManager);
    get(trackId: string): Promise<Track>;
    getMany(trackIds: string[]): Promise<Track[]>;
    getDownloadInfo(trackId: string): Promise<DownloadInfo[]>;
    getDownloadInfoRaw(trackId: string): Promise<any>;
    /**
     * Получение прямой ссылки на mp3 трек
     * Выбирает нужный формат по битрейту или первый доступный
     */
    getTrackURL(trackId: string, preferredBitrate?: number): Promise<string>;
    /**
       * Получение дополнительной информации о треке
       * Текст песни, видео и т.д.
       */
    getSupplement(trackId: string): Promise<TrackSupplement>;
    getSimilar(trackId: string): Promise<SimilarTracks>;
    getLyrics(trackId: string): Promise<any>;
    getAllLikedTracks(userId: number, pageSize?: number): Promise<Track[]>;
    likeTracks(userId: number, trackIds: string[]): Promise<void>;
    removeLikedTracks(userId: number, trackIds: string[]): Promise<void>;
    getDislikedTracks(userId: number): Promise<string[]>;
    /**
       * Получение прямого URL обложки трека
       * @param track Track
       * @param size желаемый размер (например 1000)
       */
    getCoverUrl(track: Track, size?: number): string | null;
}

interface Playlist {
    playlistUuid: string;
    uid: number;
    kind: number;
    title: string;
    description: string;
    descriptionFormatted?: string;
    available: boolean;
    collective: boolean;
    created: string;
    modified: string;
    backgroundColor?: string;
    textColor?: string;
    durationMs: number;
    isBanner: boolean;
    isPremiere: boolean;
    visibility: 'public' | 'private';
    owner?: Artist;
    tracks?: Track[];
    revision?: number;
    snapshot?: number;
    tags?: Array<{
        id: string;
        value: string;
    }>;
    likesCount?: number;
    trackCount: number;
    coverUri?: string;
    ogImage?: string;
    isFavorite?: boolean;
}

interface PlaylistChangeOperation {
    op: "insert" | "delete";
    at?: number;
    from?: number;
    to?: number;
    tracks: Array<{
        id: string;
        albumId: string;
    }>;
}
declare class PlaylistsApi extends BaseApi {
    constructor(authManager: AuthManager);
    get(userId: number, playlistKind: number): Promise<Playlist>;
    getList(userId: number): Promise<Playlist[]>;
    getByIds(playlistIds: Array<{
        uid: number;
        kind: number;
    }>): Promise<Playlist[]>;
    create(userId: number, title: string, visibility?: "public" | "private"): Promise<Playlist>;
    rename(userId: number, playlistKind: number, newName: string): Promise<Playlist>;
    delete(userId: number, playlistKind: number): Promise<void>;
    setVisibility(userId: number, playlistKind: number, visibility: "public" | "private"): Promise<Playlist>;
    addTracks(userId: number, playlistKind: number, tracks: Array<{
        id: string;
        albumId: string;
    }>, at?: number): Promise<Playlist>;
    removeTracks(userId: number, playlistKind: number, tracks: Array<{
        id: string;
        albumId: string;
    }>, from?: number, to?: number): Promise<Playlist>;
    getRecommendations(userId: number, playlistKind: number): Promise<any>;
}

declare class AlbumsApi extends BaseApi {
    constructor(authManager: AuthManager);
    get(albumId: number): Promise<Album>;
    getWithTracks(albumId: number): Promise<Album>;
    getMany(albumIds: number[]): Promise<Album[]>;
}

interface ArtistTracksResult {
    artist: Artist;
    tracks: Track[];
}
declare class ArtistsApi extends BaseApi {
    constructor(authManager: AuthManager);
    getPopularTracks(artistId: string): Promise<ArtistTracksResult>;
    getInfo(artistId: string): Promise<Artist>;
    getTracks(artistId: string, page?: number, pageSize?: number): Promise<{
        artist: Artist;
        tracks: Track[];
    }>;
    getAlbums(artistId: string, page?: number, pageSize?: number, sortBy?: "year" | "rating"): Promise<any>;
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
    getBriefInfo(artistId: string): Promise<any>;
}

interface RadioStation {
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
interface SequenceItem {
    type: string;
    track: Track;
    liked: boolean;
    trackParameters?: {
        bpm?: number;
        hue?: number;
        energy?: number;
    };
}
interface RadioSession {
    id: {
        type: string;
        tag: string;
    };
    sequence: SequenceItem[];
    batchId: string;
    pumpkin?: boolean;
    radioSessionId?: string;
}
interface RadioFeedback {
    type: 'radioStarted' | 'trackStarted' | 'trackFinished' | 'skip';
    timestamp?: string;
    from?: string;
    trackId?: string;
    totalPlayedSeconds?: number;
}
declare class RadioApi extends BaseApi {
    constructor(authManager: AuthManager);
    getStations(): Promise<RadioStation[]>;
    getStationTracks(stationId: string, settings2?: boolean): Promise<RadioSession>;
    sendFeedback(stationId: string, feedback: RadioFeedback, batchId?: string): Promise<void>;
    skipTrack(stationId: string, trackId: string, batchId: string, totalPlayedSeconds: number): Promise<void>;
    getStationInfo(stationId: string): Promise<any>;
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
    getAccountStatus(): Promise<any>;
}

/** Результаты поиска со всеми полями */
interface SearchResult {
    best?: BestMatch;
    tracks?: SearchResultSection<Track>;
    albums?: SearchResultSection<Album>;
    artists?: SearchResultSection<Artist>;
    playlists?: SearchResultSection<Playlist>;
    videos?: SearchResultSection<any>;
    podcasts?: SearchResultSection<any>;
    podcast_episodes?: SearchResultSection<any>;
    text?: string;
    type?: 'track' | 'album' | 'artist' | 'playlist' | 'all';
    page?: number;
    perPage?: number;
    searchRequestId?: string;
    misspellCorrected?: boolean;
    misspellOriginal?: string;
    nocorrect?: boolean;
}
interface BestMatch {
    type: 'track' | 'album' | 'artist' | 'playlist';
    result: Track | Album | Artist | Playlist;
}
/** Секция результатов поиска с массивом результатов */
interface SearchResultSection<T> {
    type?: string;
    total: number;
    perPage: number;
    order?: number;
    pager?: {
        total: number;
        limit: number;
        offset: number;
    };
    results: T[];
}

declare class SearchApi extends BaseApi {
    constructor(authManager: AuthManager);
    search(text: string, type?: string, page?: number, nocorrect?: boolean): Promise<SearchResult>;
    searchTracks(text: string, page?: number): Promise<SearchResultSection<Track>>;
    searchAlbums(text: string, page?: number): Promise<SearchResultSection<Album>>;
    searchArtists(text: string, page?: number): Promise<SearchResultSection<Artist>>;
    searchPlaylists(text: string, page?: number): Promise<SearchResultSection<Playlist>>;
    suggest(part: string): Promise<any>;
}

interface LandingBlock {
    type: string;
    title?: string;
    id: string;
    entities?: any[];
}
interface Landing {
    blocks: LandingBlock[];
}
interface Genre {
    id: string;
    name: string;
    imageUrl?: string;
}
declare class LandingApi extends BaseApi {
    constructor(authManager: AuthManager);
    /**
     * Получить блоки главной страницы
     * GET /landing3
     *
     * @param blockTypes - Типы блоков (например: "playlist_of_the_day,chart_week")
     * @returns Объект с блоками главной страницы
     */
    getLanding(blockTypes?: string[]): Promise<any>;
    /**
     * Получить конкретный блок главной страницы
     * GET /landing3/{landingBlock}
     *
     * @param landingBlock - ID или название блока
     * @returns Результат блока
     */
    getLandingBlock(landingBlock: string): Promise<any>;
    /**
     * Получить новые релизы
     * GET /landing3/new-releases
     *
     * @returns Блок с новыми релизами
     */
    getNewReleases(): Promise<any>;
    /**
     * Получить подкасты
     * GET /landing3/podcasts
     *
     * @returns Блок с подкастами
     */
    getPodcasts(): Promise<any>;
    /**
     * Получить новые плейлисты
     * GET /landing3/new-playlists
     *
     * @returns Блок с новыми плейлистами
     */
    getNewPlaylists(): Promise<any>;
    /**
     * Получить чарты
     * GET /landing3/chart/{chartType}
     *
     * @param chartType - Тип чарта (например: "world", "russia", "mosaic")
     * @returns Блок с чартом
     */
    getChart(chartType?: string): Promise<any>;
    /**
     * Получить плейлист дня
     * GET /landing3 (blocks=playlist_of_the_day)
     *
     * @returns Плейлист дня
     */
    getPlaylistOfTheDay(): Promise<any>;
    /**
     * Получить чарт недели
     * GET /landing3 (blocks=chart_week)
     *
     * @returns Чарт недели
     */
    getChartWeek(): Promise<any>;
    /**
     * Получить чарт месяца
     * GET /landing3 (blocks=chart_month)
     *
     * @returns Чарт месяца
     */
    getChartMonth(): Promise<any>;
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
    getGenres(): Promise<Genre[]>;
}

interface FeedDay {
    date: string;
    events: any[];
}
interface FeedResult {
    canGetMoreEvents: boolean;
    days: FeedDay[];
    generatedPlaylists: any[];
    headlines: any[];
    isWizardPassed: boolean;
    pumpkin: boolean;
    today: string;
}
declare class FeedApi extends BaseApi {
    constructor(authManager: AuthManager);
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
    getFeed(): Promise<FeedResult>;
}

interface QueueItem {
    id: string;
    currentIndex?: number;
    tracks: Track[];
    updated?: string;
    [key: string]: any;
}
interface QueuesResult {
    queues: QueueItem[];
    [key: string]: any;
}
interface UpdateQueueResult {
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
declare const DEFAULT_DEVICE_HEADER = "os=unknown; os_version=unknown; manufacturer=unknown; model=unknown; clid=; device_id=unknown; uuid=unknown";
declare class QueuesApi extends BaseApi {
    constructor(authManager: AuthManager);
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
    getQueues(deviceHeader?: string): Promise<QueuesResult>;
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
    getQueue(queueId: string): Promise<QueueItem>;
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
    updatePosition(queueId: string, currentIndex: number, isInteractive?: boolean): Promise<UpdateQueueResult>;
}

interface Tag {
    id: string;
    value: string;
    name: string;
    ogDescription?: string;
    ogImage?: string;
}
interface PlaylistId {
    uid: number;
    kind: number;
}
interface TagResult {
    tag: Tag;
    ids: PlaylistId[];
    playlists?: Playlist[];
}
declare class TagsApi extends BaseApi {
    constructor(authManager: AuthManager);
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
    getPlaylistsByTag(tagId: string): Promise<TagResult>;
}

interface BooksAndPodcastsResult {
    title: string;
    blocks: any[];
}
declare class NonMusicApi extends BaseApi {
    constructor(authManager: AuthManager);
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
    getBooksAndPodcasts(): Promise<BooksAndPodcastsResult>;
}

interface YandexMusicClientOptions {
    token?: string;
    storagePath?: string;
}
declare class YandexMusicClient {
    auth: AuthManager;
    account: AccountApi;
    users: UsersApi;
    tracks: TracksApi;
    playlists: PlaylistsApi;
    albums: AlbumsApi;
    artists: ArtistsApi;
    radio: RadioApi;
    search: SearchApi;
    landing: LandingApi;
    feed: FeedApi;
    queues: QueuesApi;
    tags: TagsApi;
    nonMusic: NonMusicApi;
    constructor(options?: YandexMusicClientOptions);
    get isAuthorized(): boolean;
    login(): Promise<string>;
    logout(): Promise<void>;
}

/**
 * Размеры обложек, доступные в Яндекс Музыке
 * Supported cover sizes: 30, 50, 100, 150, 200, 300, 400, 700, 800, 1000
 */
type CoverSize = 30 | 50 | 100 | 150 | 200 | 300 | 400 | 700 | 800 | 1000;
/**
 * Преобразует шаблон coverUri в полный URL изображения
 *
 * @param coverUri - Шаблон обложки от API (например: "avatars.yandex.net/get-music-content/4387391/bd7e0266.a.16209238-1/%%")
 * @param size - Размер обложки в пикселях (по умолчанию 200x200)
 * @returns Полный URL изображения обложки
 *
 * @example
 * ```typescript
 * const track = await client.tracks.get('track-id');
 * const coverUrl = getCoverUrl(track.coverUri, 300);
 * // => "https://avatars.yandex.net/get-music-content/4387391/bd7e0266.a.16209238-1/300x300"
 * ```
 */
declare function getCoverUrl(coverUri: string | undefined, size?: CoverSize): string | null;
/**
 * Проверяет, есть ли обложка у трека
 *
 * @param coverUri - Шаблон обложки от API
 * @returns true если обложка доступна, false если нет
 */
declare function hasCover(coverUri: string | undefined): boolean;
/**
 * Получает все доступные размеры для обложки
 *
 * @param coverUri - Шаблон обложки от API
 * @returns Объект со всеми доступными размерами
 *
 * @example
 * ```typescript
 * const track = await client.tracks.get('track-id');
 * const covers = getAllCoverSizes(track.coverUri);
 * // => {
 * //   small: 'https://..../60x60',
 * //   medium: 'https://..../200x200',
 * //   large: 'https://..../500x500'
 * // }
 * ```
 */
declare function getAllCoverSizes(coverUri: string | undefined): {
    small: string | null;
    medium: string | null;
    large: string | null;
    xlarge: string | null;
};

export { AccountApi, type AccountStatus, type Album, AlbumsApi, type Artist, type ArtistTracksResult, ArtistsApi, AuthManager, type AuthManagerOptions, AuthState, BaseApi, type BestMatch, type BooksAndPodcastsResult, type CoverSize, DEFAULT_DEVICE_HEADER, type DownloadInfo, ElectronOAuth, type Experiments, FeedApi, type FeedDay, type FeedResult, type Genre, HttpClient, type Landing, LandingApi, type LandingBlock, NonMusicApi, type Playlist, type PlaylistChangeOperation, type PlaylistId, PlaylistsApi, type QueueItem, QueuesApi, type QueuesResult, RadioApi, type RadioFeedback, type RadioSession, type RadioStation, SearchApi, type SearchResult, type SearchResultSection, type SequenceItem, type SimilarTracks, type Tag, type TagResult, TagsApi, TokenStorage, type Track, type TrackSupplement, TracksApi, type UpdateQueueResult, type UserInfo, type UserSettings, UsersApi, YandexMusicClient, type YandexMusicClientOptions, getAllCoverSizes, getCoverUrl, hasCover };
