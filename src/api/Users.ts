// src/api/Users.ts

import { BaseApi } from "./BaseApi.ts";
import { AuthManager } from "../auth/AuthManager.ts";

export interface UserInfo {
  uid: number;
  login: string;
  name?: string;
  sex?: string;
  homelocation?: string;
  verified: boolean;
}

export class UsersApi extends BaseApi {
  constructor(authManager: AuthManager) {
    super(authManager);
  }

  async getInfo(userId: string): Promise<UserInfo> {
    const response = await this.http.get<{
      invocationInfo: any;
      result: UserInfo;
    }>(`/users/${userId}`);
    return response.result;
  }
}

