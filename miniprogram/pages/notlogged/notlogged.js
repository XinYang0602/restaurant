// notlogged.js
Page({
  data: {
    hasUserInfo: false,
    userInfo: {}
  },
  
  onLoad() {
    // 页面加载时检查用户是否已登录
    this.checkUserLoginStatus();
  },
  
  // 检查用户登录状态
  checkUserLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo,
        hasUserInfo: true
      });
      
      // 如果已登录，跳转到个人中心页面
      wx.navigateTo({
        url: '/pages/profile/profile'
      });
    }
  },
  
  // 处理用户登录
  async handleLogin() {
    try {
      // 显示加载提示
      wx.showLoading({
        title: '登录中...',
        mask: true
      });
      
      console.log('开始登录流程');
      
      // 获取用户信息
      console.log('请求用户信息');
      const userProfileRes = await wx.getUserProfile({
        desc: '用于完善会员资料'
      });
      
      const userInfo = userProfileRes.userInfo;
      console.log('获取到用户信息:', userInfo);
      
      // 调用云函数
      console.log('调用云函数userLogin');
      const loginRes = await wx.cloud.callFunction({
        name: 'userLogin',
        data: {
          userInfo
        }
      });
      
      console.log('云函数返回结果:', loginRes);
      
      // 隐藏加载提示
      wx.hideLoading();
      
      // 类型断言确保类型安全
      const result = (loginRes.result || {});
      
      if (result.code === 200) {
        console.log('登录成功, openid:', result.openid);
        // 登录成功处理
        this.setData({
          userInfo,
          hasUserInfo: true
        });
        
        // 保存用户信息到本地存储
        wx.setStorageSync('userInfo', userInfo);
        wx.setStorageSync('openid', result.openid || '');
        
        // 根据是否是新用户显示不同提示
        wx.showToast({
          title: result.isNewUser ? '注册成功' : '登录成功',
          icon: 'success',
          duration: 2000
        });
        
        // 登录成功后跳转到个人中心
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/profile/profile'
          });
        }, 1000);
      } else {
        console.error('登录返回错误码:', result.code, result.message);
        throw new Error(result.message || '登录失败');
      }
    } catch (err) {
      console.error('登录过程发生错误:', err);
      wx.hideLoading();
      
      // 处理登录失败情况
      wx.showToast({
        title: err.message || '登录失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  },
  
  // 添加标签栏导航方法
  switchToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
}); 