// profile.ts

// 定义订单项类型
interface OrderItem {
  id: string;
  name: string;
  price: number;
  count: number;
  totalPrice: number;
}

// 定义订单类型
interface Order {
  id: string;
  items: OrderItem[];
  totalCount: number;
  totalPrice: string;
  orderTime: number;
  orderTimeFormatted?: string;
  deliveryTime: string;
  status: 'processing' | 'completed';
}

// 定义用户信息类型
interface UserInfo {
  avatarUrl?: string;
  nickName?: string;
}

// 特定的管理员openid
const SUPER_ADMIN_OPENID = 'opl2r7S45cPG_M11i00myZVX1wdc';

// 获取全局应用实例
const globalApp = getApp<IAppOption>();

Page({
  data: {
    defaultAvatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
    userInfo: {} as UserInfo,
    orders: [] as Order[],
    isAdmin: false,
    isSuperAdmin: false, // 添加超级管理员标志
    isLoggedIn: false // 添加登录状态标记
  },

  onLoad() {
    // 检查登录状态
    this.checkLoginStatus();
    
    // 获取用户信息
    this.getUserInfo();
    
    // 获取订单历史
    this.getOrderHistory();
  },

  onShow() {
    // 页面显示时刷新登录状态和订单
    this.checkLoginStatus();
    this.getUserInfo();
    this.getOrderHistory();
  },

  // 检查登录状态
  checkLoginStatus() {
    const isLoggedIn = globalApp.globalData.isLoggedIn;
    const openid = globalApp.globalData.openid;
    
    // 设置页面登录状态
    this.setData({
      isLoggedIn: isLoggedIn
    });
    
    // 设置管理员状态
    if (isLoggedIn) {
      this.setData({
        isAdmin: globalApp.globalData.isAdmin,
        // 检查是否是特定的超级管理员
        isSuperAdmin: openid === SUPER_ADMIN_OPENID
      });
      
      // 如果是特定管理员，打印日志
      if(openid === SUPER_ADMIN_OPENID) {
        console.log('超级管理员登录，openid:', openid);
      }
    }
  },
  
  // 跳转到登录页
  gotoLogin() {
    wx.navigateTo({
      url: '/pages/notlogged/notlogged'
    });
  },

  // 获取用户信息
  getUserInfo() {
    // 获取全局用户信息
    const userInfo = globalApp.globalData.userInfo;
    
    if (userInfo) {
      this.setData({
        userInfo
      });
    }
  },

  // 获取订单历史
  getOrderHistory() {
    // 如果未登录，则不获取订单历史
    if (!this.data.isLoggedIn) {
      return;
    }
    
    const allOrders = wx.getStorageSync('orders') || [];
    
    // 格式化时间并取最近3个订单
    const orders = allOrders.map((order: Order) => {
      const date = new Date(order.orderTime);
      return {
        ...order,
        orderTimeFormatted: `${date.getFullYear()}-${this.padZero(date.getMonth() + 1)}-${this.padZero(date.getDate())} ${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`
      };
    }).slice(0, 3);
    
    this.setData({
      orders
    });
  },

  // 数字补零
  padZero(num: number): string {
    return num < 10 ? '0' + num : '' + num;
  },

  // 编辑个人资料
  editProfile() {
    wx.showActionSheet({
      itemList: ['选择头像', '设置昵称'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 选择头像
          wx.chooseImage({
            count: 1,
            sizeType: ['compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
              // 设置头像
              const userInfo = this.data.userInfo || {};
              userInfo.avatarUrl = res.tempFilePaths[0];
              
              this.setData({
                userInfo
              });
              
              // 更新全局数据和本地存储
              globalApp.globalData.userInfo = userInfo;
              wx.setStorageSync('userInfo', userInfo);
            }
          });
        } else if (res.tapIndex === 1) {
          // 设置昵称
          wx.showModal({
            title: '设置昵称',
            editable: true,
            placeholderText: '请输入您的昵称',
            success: (res) => {
              if (res.confirm && res.content) {
                const userInfo = this.data.userInfo || {};
                userInfo.nickName = res.content;
                
                this.setData({
                  userInfo
                });
                
                // 更新全局数据和本地存储
                globalApp.globalData.userInfo = userInfo;
                wx.setStorageSync('userInfo', userInfo);
              }
            }
          });
        }
      }
    });
  },

  // 查看所有订单
  viewAllOrders() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    });
  },

  // 查看订单详情
  viewOrderDetail(e: WechatMiniprogram.CustomEvent) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({
      title: `查看订单: ${id}`,
      icon: 'none'
    });
  },

  // 跳转到管理页面（仅管理员可见）
  goToAdmin() {
    if (this.data.isAdmin || this.data.isSuperAdmin) {
      wx.navigateTo({
        url: '/pages/admin/admin'
      });
    } else {
      wx.showToast({
        title: '权限不足',
        icon: 'none'
      });
    }
  },
  
  // 跳转到后端管理界面（增删改查）
  goToBackend() {
    if (this.data.isSuperAdmin) {
      wx.navigateTo({
        url: '/pages/backend/backend'
      });
    } else {
      wx.showToast({
        title: '权限不足',
        icon: 'none'
      });
    }
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('openid');
          
          // 重置全局状态
          globalApp.globalData.userInfo = null;
          globalApp.globalData.openid = '';
          globalApp.globalData.isLoggedIn = false;
          globalApp.globalData.isAdmin = false;
          
          this.setData({
            userInfo: {},
            isAdmin: false,
            isSuperAdmin: false,
            isLoggedIn: false
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  // 切换到底部标签栏主页
  switchToHome() {
    wx.switchTab({
      url: '/pages/index/index'
    });
  }
}) 