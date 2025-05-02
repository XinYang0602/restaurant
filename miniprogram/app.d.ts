/// <reference path="./types/index.d.ts" />
/// <reference path="./node_modules/miniprogram-api-typings/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo: any | null;
    isLoggedIn: boolean;
    openid: string;
    isAdmin: boolean;
  };
  userInfoReadyCallback?: any;
  checkLoginStatus: () => Promise<void>;
  checkAdminStatus: (openid: string) => Promise<void>;
} 