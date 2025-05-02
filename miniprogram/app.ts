// app.ts
// 引入IAppOption接口
/// <reference path="./app.d.ts" />

App<IAppOption>({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    openid: '',
    isAdmin: false
  },
  onLaunch() {
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'cloud1-0gib4wvca1828cf9', // 请替换为您的云环境ID
        traceUser: true,
      });
    } else {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    }

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 检查登录状态
    this.checkLoginStatus();
  },

  // 检查登录状态
  async checkLoginStatus() {
    try {
      // 从本地存储获取用户信息
      const userInfo = wx.getStorageSync('userInfo');
      const openid = wx.getStorageSync('openid');
      
      if (userInfo && openid) {
        // 更新全局数据
        this.globalData.userInfo = userInfo;
        this.globalData.openid = openid;
        this.globalData.isLoggedIn = true;
        
        // 检查用户是否是管理员
        await this.checkAdminStatus(openid);
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
    }
  },
  
  // 检查用户是否是管理员
  async checkAdminStatus(openid: string) {
    try {
      const result = await wx.cloud.callFunction({
        name: 'checkAdmin',
        data: { openid }
      });
      
      // 类型断言
      const data = result.result as { isAdmin: boolean } | undefined;
      this.globalData.isAdmin = data?.isAdmin || false;
      console.log('管理员状态:', this.globalData.isAdmin);
    } catch (error) {
      console.error('检查管理员状态失败:', error);
      this.globalData.isAdmin = false;
    }
  }
})