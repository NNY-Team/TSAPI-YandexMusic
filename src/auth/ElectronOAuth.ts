// src/auth/ElectronOAuth.ts
import { BrowserWindow, session } from "electron";

export class ElectronOAuth {
  oauthWindow: BrowserWindow | null = null;

  OAUTH_URL = `https://oauth.yandex.ru/authorize?response_type=token&client_id=23cabbbdc6cd418abb4b39c32c41195d`;

  URL_WITH_TOKEN_REGEX = /#access_token=([^&]+)/;

  async authorize(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.oauthWindow = new BrowserWindow({
        width: 600,
        height: 700,
        modal: true,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        }
      });

      this.oauthWindow.loadURL(this.OAUTH_URL);

      // Ловим изменение URL
      this.oauthWindow.webContents.on("did-navigate", (_: any, url: string) => {
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
    const ses = session.defaultSession;
    const cookies = await ses.cookies.get({});
    for (const c of cookies) {
      ses.cookies.remove(c.domain || "", c.path || "/");
    }
  }
}

