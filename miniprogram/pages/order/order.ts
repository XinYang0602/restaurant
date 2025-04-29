// order.ts

// 定义购物车项类型
interface CartItem {
  id: string;
  name: string;
  price: number;
  count: number;
  totalPrice: number;
}

// 定义菜品类型
interface Dish {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  count: number;
}

// 定义菜品数据类型
interface DishesData {
  [key: number]: Dish[];
}

Page({
  data: {
    deliveryTime: '10分钟后',
    cartItems: [] as CartItem[],
    totalPrice: '0.00',
    totalCount: 0
  },

  onLoad() {
    // 从本地存储获取购物车数据
    this.loadCartItems();
  },

  // 加载购物车数据
  loadCartItems() {
    const cart = wx.getStorageSync('cart') || [];
    
    if (cart.length === 0) {
      wx.showToast({
        title: '购物车为空',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    // 获取所有菜品数据
    const allDishes = this.getAllDishes();
    
    // 根据购物车获取菜品详情
    const cartItems: CartItem[] = [];
    let totalCount = 0;
    let totalPrice = 0;
    
    cart.forEach((item: {id: string, count: number}) => {
      const dish = allDishes.find(d => d.id === item.id);
      if (dish) {
        const itemTotalPrice = dish.price * item.count;
        cartItems.push({
          id: dish.id,
          name: dish.name,
          price: dish.price,
          count: item.count,
          totalPrice: itemTotalPrice
        });
        
        totalCount += item.count;
        totalPrice += itemTotalPrice;
      }
    });
    
    this.setData({
      cartItems,
      totalCount,
      totalPrice: totalPrice.toFixed(2)
    });
  },

  // 获取所有菜品数据
  getAllDishes(): Dish[] {
    // 从页面栈获取首页实例，以便访问dishes数据
    const pages = getCurrentPages();
    const indexPage = pages.find(page => page.route === 'pages/index/index');
    
    if (!indexPage) {
      return [];
    }
    
    const dishes = (indexPage as any).data.dishes as DishesData;
    const allDishes: Dish[] = [];
    
    // 将所有分类的菜品合并到一个数组
    Object.keys(dishes).forEach(categoryId => {
      allDishes.push(...dishes[Number(categoryId)]);
    });
    
    return allDishes;
  },

  // 增加菜品数量
  increaseItem(e: WechatMiniprogram.CustomEvent) {
    const id = e.currentTarget.dataset.id as string;
    const cartItems = this.data.cartItems;
    let totalCount = this.data.totalCount;
    let totalPrice = parseFloat(this.data.totalPrice);
    
    // 找到对应的菜品并增加数量
    const item = cartItems.find(item => item.id === id);
    if (item) {
      item.count++;
      item.totalPrice = item.price * item.count;
      
      totalCount++;
      totalPrice += item.price;
      
      // 更新购物车
      this.updateCart(id, item.count);
      
      this.setData({
        cartItems,
        totalCount,
        totalPrice: totalPrice.toFixed(2)
      });
    }
  },

  // 减少菜品数量
  decreaseItem(e: WechatMiniprogram.CustomEvent) {
    const id = e.currentTarget.dataset.id as string;
    const cartItems = this.data.cartItems;
    let totalCount = this.data.totalCount;
    let totalPrice = parseFloat(this.data.totalPrice);
    
    // 找到对应的菜品并减少数量
    const item = cartItems.find(item => item.id === id);
    if (item && item.count > 0) {
      item.count--;
      item.totalPrice = item.price * item.count;
      
      totalCount--;
      totalPrice -= item.price;
      
      // 更新购物车
      this.updateCart(id, item.count);
      
      // 如果数量为0，从列表中移除
      if (item.count === 0) {
        const index = cartItems.findIndex(i => i.id === id);
        if (index > -1) {
          cartItems.splice(index, 1);
        }
        
        // 如果购物车为空，返回上一页
        if (cartItems.length === 0) {
          wx.showToast({
            title: '购物车为空',
            icon: 'none'
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
          return;
        }
      }
      
      this.setData({
        cartItems,
        totalCount,
        totalPrice: totalPrice.toFixed(2)
      });
    }
  },

  // 更新购物车
  updateCart(id: string, count: number) {
    const cart = wx.getStorageSync('cart') || [];
    const index = cart.findIndex((item: {id: string}) => item.id === id);
    
    if (count > 0) {
      // 如果数量大于0，添加或更新购物车
      if (index > -1) {
        cart[index].count = count;
      } else {
        cart.push({ id, count });
      }
    } else {
      // 如果数量为0，从购物车中移除
      if (index > -1) {
        cart.splice(index, 1);
      }
    }
    
    wx.setStorageSync('cart', cart);
    
    // 通知首页更新购物车计数
    const pages = getCurrentPages();
    const indexPage = pages.find(page => page.route === 'pages/index/index');
    if (indexPage) {
      (indexPage as any).setData({
        cartCount: cart.reduce((acc: number, item: {count: number}) => acc + item.count, 0)
      });
      (indexPage as any).updateDishesCount();
    }
  },

  // 提交订单
  submitOrder() {
    // 订单信息
    const orderInfo = {
      items: this.data.cartItems,
      totalCount: this.data.totalCount,
      totalPrice: this.data.totalPrice,
      orderTime: new Date().getTime(),
      deliveryTime: this.data.deliveryTime,
      status: 'processing' // 初始状态：制作中
    };
    
    // 将订单信息保存到本地存储
    const orders = wx.getStorageSync('orders') || [];
    const orderId = 'ORDER' + Date.now(); // 简单的订单ID生成方式
    orders.push({
      id: orderId,
      ...orderInfo
    });
    wx.setStorageSync('orders', orders);
    
    // 清空购物车
    wx.setStorageSync('cart', []);
    
    // 提示订单已提交
    wx.showToast({
      title: '订单已提交',
      icon: 'success'
    });
    
    // 跳转到首页
    setTimeout(() => {
      wx.switchTab({
        url: '/pages/index/index'
      });
    }, 1500);
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  }
}) 