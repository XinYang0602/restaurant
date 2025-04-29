// admin.ts

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
  completeTime?: number;
  completeTimeFormatted?: string;
}

// 声明组件需要的属性和数据
type IData = {
  activeTab: string;
  orders: Order[];
  processingOrders: Order[];
  completedOrders: Order[];
  processingCount: number;
}

Page({
  data: {
    activeTab: 'all',
    orders: [] as Order[],
    processingOrders: [] as Order[],
    completedOrders: [] as Order[],
    processingCount: 0
  } as IData,

  // 声明refreshTimer
  refreshTimer: undefined as number | undefined,

  onLoad() {
    // 加载订单数据
    this.loadOrders();

    // 设置定时刷新
    this.startRefreshTimer();
  },

  onShow() {
    // 页面显示时刷新订单数据
    this.loadOrders();
  },

  onUnload() {
    // 清除定时器
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  },

  // 设置定时刷新
  startRefreshTimer() {
    // 每30秒刷新一次订单数据
    this.refreshTimer = setInterval(() => {
      this.loadOrders();
    }, 30000) as unknown as number;
  },

  // 加载订单数据
  loadOrders() {
    const allOrders = wx.getStorageSync('orders') || [];
    
    // 格式化订单时间
    const orders = allOrders.map((order: Order) => {
      // 格式化订单时间
      const orderDate = new Date(order.orderTime);
      const orderTimeFormatted = `${this.formatDate(orderDate)}`;
      
      // 如果是已完成订单，格式化完成时间
      let completeTimeFormatted = '';
      if (order.status === 'completed' && order.completeTime) {
        const completeDate = new Date(order.completeTime);
        completeTimeFormatted = `${this.padZero(completeDate.getHours())}:${this.padZero(completeDate.getMinutes())}`;
      }
      
      return {
        ...order,
        orderTimeFormatted,
        completeTimeFormatted
      };
    });
    
    // 按时间倒序排序（最新的订单在前）
    orders.sort((a: Order, b: Order) => b.orderTime - a.orderTime);
    
    // 过滤出制作中和已完成的订单
    const processingOrders = orders.filter((order: Order) => order.status === 'processing');
    const completedOrders = orders.filter((order: Order) => order.status === 'completed');
    
    this.setData({
      orders,
      processingOrders,
      completedOrders,
      processingCount: processingOrders.length
    });
  },

  // 格式化日期
  formatDate(date: Date): string {
    return `${date.getFullYear()}-${this.padZero(date.getMonth() + 1)}-${this.padZero(date.getDate())} ${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`;
  },

  // 数字补零
  padZero(num: number): string {
    return num < 10 ? '0' + num : '' + num;
  },

  // 标签页切换
  onTabChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({
      activeTab: e.detail.value
    });
  },

  // 完成订单
  completeOrder(e: WechatMiniprogram.CustomEvent) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认完成订单',
      content: `确定将订单 #${id} 标记为已完成？`,
      success: (res) => {
        if (res.confirm) {
          // 从本地存储获取订单
          const allOrders = wx.getStorageSync('orders') || [];
          
          // 找到对应的订单并修改状态
          const orderIndex = allOrders.findIndex((order: Order) => order.id === id);
          if (orderIndex > -1) {
            allOrders[orderIndex].status = 'completed';
            allOrders[orderIndex].completeTime = new Date().getTime();
            
            // 保存修改后的订单数据
            wx.setStorageSync('orders', allOrders);
            
            // 刷新页面数据
            this.loadOrders();
            
            wx.showToast({
              title: '订单已完成',
              icon: 'success'
            });
          }
        }
      }
    });
  }
}) 