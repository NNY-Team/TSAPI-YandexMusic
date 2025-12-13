// src/client.ts
import { AccountApi } from "./api/Account.ts";
import { UsersApi } from "./api/Users.ts";
import { TracksApi } from "./api/Tracks.ts";
import { PlaylistsApi } from "./api/Playlists.ts";
import { AlbumsApi } from "./api/Albums.ts";
import { ArtistsApi } from "./api/Artists.ts";
import { RadioApi } from "./api/Radio.ts";
import { SearchApi } from "./api/Search.ts";
import { LandingApi } from "./api/Landing.ts";
import { FeedApi } from "./api/Feed.ts";
import { QueuesApi } from "./api/Queues.ts";
import { TagsApi } from "./api/Tags.ts";
import { NonMusicApi } from "./api/NonMusic.ts";
import { AuthManager, AuthState } from "./auth/AuthManager.ts";

export interface YandexMusicClientOptions {
  token?: string;
  storagePath?: string;
}

export class YandexMusicClient {
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

  constructor(options: YandexMusicClientOptions = {}) {
    this.auth = new AuthManager({
      token: options.token,
      storagePath: options.storagePath,
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

  get isAuthorized(): boolean {
    return this.auth.state === AuthState.AUTHORIZED;
  }

  async login(): Promise<string> {
    return this.auth.login();
  }

  async logout(): Promise<void> {
    return this.auth.logout();
  }
}


