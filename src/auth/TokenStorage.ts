// Detect environment
const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
const isBrowser = typeof window !== 'undefined';

let fs: any = null;
let path: any = null;
let app: any = null;

// Only import Node.js modules in Node.js environment
if (isNode) {
  try {
    fs = require("fs");
  } catch (e) {
    // Can't import fs
  }
  try {
    path = require("path");
  } catch (e) {
    // Can't import path
  }
}

try {
  app = require("electron").app;
} catch (e) {
  // Electron not available
}

export class TokenStorage {
  private filePath: string | null;
  private storageKey = 'yandex_music_token';

  constructor(storagePath?: string) {
    // Browser mode - use localStorage
    if (isBrowser && (!isNode || !fs || !path)) {
      this.filePath = null;
      return;
    }

    if (!isNode || !fs || !path) {
      this.filePath = null;
      return;
    }

    // Node.js mode - use file system
    let dir: string;
    
    if (storagePath) {
      dir = storagePath;
    } else if (app) {
      dir = app.getPath("userData");
    } else {
      // Fallback to home directory or temp
      const home = process.env.HOME || process.env.USERPROFILE || "/tmp";
      dir = home;
    }
    
    try {
      this.filePath = path.join(dir, "yandex-token.json");
    } catch {
      this.filePath = null;
    }
  }

  async saveToken(token: string): Promise<void> {
    if (!this.filePath) {
      // Browser mode - use localStorage
      if (isBrowser) {
        try {
          localStorage.setItem(this.storageKey, token);
        } catch {
          console.warn('Failed to save token to localStorage');
        }
      }
      return;
    }

    // Node.js mode - use file system
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
      // Silently fail if we can't save
    }
  }

  async getToken(): Promise<string | null> {
    if (!this.filePath) {
      // Browser mode - use localStorage
      if (isBrowser) {
        try {
          return localStorage.getItem(this.storageKey);
        } catch {
          return null;
        }
      }
      return null;
    }

    // Node.js mode - use file system
    if (!fs) {
      return null;
    }

    try {
      return JSON.parse(fs.readFileSync(this.filePath, "utf8")).token;
    } catch {
      return null;
    }
  }

  async clearToken(): Promise<void> {
    if (!this.filePath) {
      // Browser mode - use localStorage
      if (isBrowser) {
        try {
          localStorage.removeItem(this.storageKey);
        } catch {
          // Ignore
        }
      }
      return;
    }

    // Node.js mode - use file system
    if (!fs) {
      return;
    }

    try {
      fs.unlinkSync(this.filePath);
    } catch {
      // Файл уже удалён или не существует
    }
  }
}

