// index.ts

// 定义菜品类型
interface Dish {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  count: number;
}

// 定义购物车项类型 (简化版，只在索引页使用)
interface CartItem {
  id: string;
  count: number;
}

// 定义菜品分类类型
interface Category {
  id: number;
  name: string;
}

// 定义菜品数据类型
interface DishesData {
  [key: string]: Dish[];
}

// 定义登录响应类型
interface LoginResult {
  code: number;
  message: string;
  isNewUser?: boolean;
  openid?: string;
}

Component({
  data: {
    defaultAvatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
    userInfo: {
      avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0',
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
    currentCategory: 0,
    cartCount: 0,
    categories: [
      { id: 0, name: '汤品' },
      { id: 1, name: '川菜' },
      { id: 2, name: '素菜' },
      { id: 3, name: '肉菜' },
      { id: 4, name: '主食' },
      { id: 5, name: '饮料' }
    ] as Category[],
    dishes: {} as DishesData,
    isCloudDataLoaded: false,
    cart: [] as CartItem[]
  },
  methods: {
    // 新增方法：从云端获取菜品数据
    async fetchDishesFromCloud() {
      try {
        const res = await wx.cloud.callFunction({
          name: 'getDishes',
          data: {}
        });
        const cloudDishes = res.result as DishesData;
        this.setData({
          dishes: cloudDishes,
          isCloudDataLoaded: true
        });
      } catch (error) {
        console.error('云端数据加载失败，使用本地数据:', error);
        this.setData({
          dishes: this.getDefaultDishes(),
          isCloudDataLoaded: false
        });
      }
    },

    // 获取本地默认数据
    getDefaultDishes(): DishesData {
      return {
        0: [
          { 
            id: '001', 
            name: '紫菜蛋花汤', 
            price: 12, 
            description: '鲜美味道，营养丰富',
            image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80',
            count: 0
          },
          { 
            id: '002', 
            name: '酸辣汤', 
            price: 18, 
            description: '经典川菜风味，酸辣可口',
            image: 'https://images.unsplash.com/photo-1613844237701-8f3664fc2eff?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80',
            count: 0
          },
          { 
            id: '003', 
            name: '西红柿蛋汤', 
            price: 15, 
            description: '番茄鲜香，温暖舒适',
            image: 'https://images.unsplash.com/photo-1626201850121-3f78f2f546b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80',
            count: 0
          },
          { 
            id: '004', 
            name: '冬瓜排骨汤', 
            price: 28, 
            description: '清爽滋补，肉香四溢',
            image: 'https://images.unsplash.com/photo-1623855244183-52fd8d3ce2f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1567&q=80',
            count: 0
          }
        ],
        1: [
          { 
            id: '101', 
            name: '麻婆豆腐', 
            price: 26, 
            description: '麻辣鲜香，入口即化',
            image: 'https://images.unsplash.com/photo-1582003457856-20898dd7e1ea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80',
            count: 0
          },
          { 
            id: '102', 
            name: '宫保鸡丁', 
            price: 38, 
            description: '咸甜适中，花生酥脆',
            image: 'https://images.unsplash.com/photo-1619683548293-866c5b805c89?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80',
            count: 0
          }
        ],
        2: [
          { 
            id: '201', 
            name: '清炒时蔬', 
            price: 18, 
            description: '新鲜应季蔬菜',
            image: 'https://images.unsplash.com/photo-1576866209830-589e1bfbaa4d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80',
            count: 0
          }
        ],
        3: [
          { 
            id: '301', 
            name: '红烧肉', 
            price: 42, 
            description: '入口即化，肥而不腻',
            image: 'https://images.unsplash.com/photo-1623161551727-7456779dda5a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80',
            count: 0
          }
        ],
        4: [
          { 
            id: '401', 
            name: '米饭', 
            price: 3, 
            description: '粒粒分明，香气扑鼻',
            image: 'https://images.unsplash.com/photo-1594489428504-5c4212155e42?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80',
            count: 0
          }
        ],
        5: [
          { 
            id: '501', 
            name: '可乐', 
            price: 6, 
            description: '冰镇可乐，畅爽一夏',
            image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80',
            count: 0
          }
        ]
      };
    },

    onLoad() {
      // 检查用户登录状态
      this.checkUserLoginStatus();
      
      // 从云端加载数据
      this.fetchDishesFromCloud();
      
      // 从本地存储读取购物车数据
      const cart = wx.getStorageSync('cart') || [];
      this.setData({
        cart: cart,
        cartCount: cart.reduce((acc: number, item: CartItem) => acc + item.count, 0)
      });
      
      // 根据购物车更新菜品数量
      this.updateDishesCount();
    },
    
    // 检查用户登录状态
    checkUserLoginStatus() {
      // 获取全局应用实例
      const app = getApp<IAppOption>();
      
      // 从全局获取登录状态
      const isLoggedIn = app.globalData.isLoggedIn;
      const userInfo = app.globalData.userInfo;
      
      if (isLoggedIn && userInfo) {
        this.setData({
          userInfo,
          hasUserInfo: true
        });
      }
    },
    
    // 事件处理函数
    bindViewTap() {
      wx.navigateTo({
        url: '../logs/logs',
      })
    },
    
    onChooseAvatar(e: any) {
      const { avatarUrl } = e.detail
      const { nickName } = this.data.userInfo
      this.setData({
        "userInfo.avatarUrl": avatarUrl,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== this.data.defaultAvatarUrl,
      })
    },
    
    onInputChange(e: any) {
      const nickName = e.detail.value
      const { avatarUrl } = this.data.userInfo
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== this.data.defaultAvatarUrl,
      })
    },
    
    getUserProfile() {
      // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
      wx.getUserProfile({
        desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
        success: (res) => {
          console.log(res)
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    },
    
    // 切换分类
    switchCategory(e: WechatMiniprogram.CustomEvent) {
      const id = e.currentTarget.dataset.id as number;
      this.setData({
        currentCategory: id
      });
    },
    
    // 增加菜品数量
    increaseDish(e: WechatMiniprogram.CustomEvent) {
      const id = e.currentTarget.dataset.id as string;
      const categoryId = this.data.currentCategory;
      const dishes = this.data.dishes;
      
      // 找到对应的菜品并增加数量
      const dish = dishes[categoryId].find((d: Dish) => d.id === id);
      if (dish) {
        dish.count++;
        
        // 更新购物车
        this.updateCart(id, dish.count);
        
        this.setData({
          dishes: dishes,
          cartCount: this.getCartCount()
        });
      }
    },
    
    // 减少菜品数量
    decreaseDish(e: WechatMiniprogram.CustomEvent) {
      const id = e.currentTarget.dataset.id as string;
      const categoryId = this.data.currentCategory;
      const dishes = this.data.dishes;
      
      // 找到对应的菜品并减少数量
      const dish = dishes[categoryId].find((d: Dish) => d.id === id);
      if (dish && dish.count > 0) {
        dish.count--;
        
        // 更新购物车
        this.updateCart(id, dish.count);
        
        this.setData({
          dishes: dishes,
          cartCount: this.getCartCount()
        });
      }
    },
    
    // 更新购物车
    updateCart(id: string, count: number) {
      const cart = this.data.cart;
      const index = cart.findIndex(item => item.id === id);
      
      if (count > 0) {
        // 如果数量大于0，添加或更新购物车
        if (index > -1) {
          cart[index].count = count;
        } else {
          cart.push({ id, count } as CartItem);
        }
      } else {
        // 如果数量为0，从购物车中移除
        if (index > -1) {
          cart.splice(index, 1);
        }
      }
      
      wx.setStorageSync('cart', cart);
    },
    
    // 获取购物车总数量
    getCartCount(): number {
      return this.data.cart.reduce((acc: number, item: CartItem) => acc + item.count, 0);
    },
    
    // 跳转到订单页
    goToOrder() {
      if (this.data.cartCount > 0) {
        wx.navigateTo({
          url: '/pages/order/order'
        });
      } else {
        wx.showToast({
          title: '请先选择菜品',
          icon: 'none'
        });
      }
    },
    
    // 根据购物车更新菜品数量
    updateDishesCount() {
      const dishes = this.data.dishes;
      const cart = this.data.cart;
      
      // 将所有菜品的count重置为0
      Object.keys(dishes).forEach((categoryId: string) => {
        dishes[categoryId].forEach((dish: Dish) => {
          dish.count = 0;
        });
      });
      
      // 根据购物车设置菜品数量
      cart.forEach(item => {
        // 查找菜品并设置数量
        for (const categoryId in dishes) {
          const dish = dishes[categoryId].find((d: Dish) => d.id === item.id);
          if (dish) {
            dish.count = item.count;
            break;
          }
        }
      });
      
      this.setData({ dishes });
    },
    
    // 处理用户登录
    async handleLogin() {
      try {
        // 获取全局应用实例
        const app = getApp<IAppOption>();
        
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
        const result = (loginRes.result || {}) as LoginResult;
        
        if (result.code === 200) {
          console.log('登录成功, openid:', result.openid);
          
          // 更新全局数据
          app.globalData.userInfo = userInfo;
          app.globalData.openid = result.openid || '';
          app.globalData.isLoggedIn = true;
          
          // 检查是否是管理员
          if (result.openid) {
            await app.checkAdminStatus(result.openid);
          }
          
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
          
          // 如果在登录页，登录成功后返回上一页
          const pages = getCurrentPages();
          if (pages.length > 1 && pages[pages.length - 1].route?.includes('notlogged')) {
            setTimeout(() => {
              wx.navigateBack();
            }, 1000);
          }
        } else {
          console.error('登录返回错误码:', result.code, result.message);
          throw new Error(result.message || '登录失败');
        }
      } catch (err: any) {
        console.error('登录过程发生错误:', err);
        wx.hideLoading();
        
        // 处理登录失败情况
        wx.showToast({
          title: err.message || '登录失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    }
  },
}) 