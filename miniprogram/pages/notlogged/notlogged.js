// notlogged.js
Page({
  data: {},
  
  onLoad() {
    // 页面加载时执行的逻辑
  },
  
  handleLogin() {
    // 微信登录逻辑
    wx.login({
      success(res) {
        if (res.code) {
          // 这里可以发送code到后端换取openid
          console.log('登录成功', res.code);
          // 登录成功后跳转到个人中心
          wx.navigateTo({
            url: '/pages/profile/profile'
          });
        } else {
          console.log('登录失败', res.errMsg);
        }
      }
    });
  }
}); 