// profile.ts

// 定义订单项类型
interface OrderItem {
  id: string;
  name: string;
  price: number;
  count: number;
  totalPrice: number;
}

// 定义订单项类型
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

Page({
  data: {
    defaultAvatarUrl: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
    userInfo: {} as UserInfo,
    orders: [] as Order[]
  },

  onLoad() {
    // 获取用户信息
    this.getUserInfo();
    
    // 获取订单历史
    this.getOrderHistory();
  },

  onShow() {
    // 页面显示时刷新订单历史
    this.getOrderHistory();
  },

  // 获取用户信息
  getUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo
      });
    }
  },

  // 获取订单历史
  getOrderHistory() {
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

  // 退出登录
  logout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          wx.removeStorageSync('userInfo');
          
          this.setData({
            userInfo: {}
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