// index.ts
// 获取应用实例
const app = getApp<IAppOption>()
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

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

Component({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
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
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
      })
    },
    onInputChange(e: any) {
      const nickName = e.detail.value
      const { avatarUrl } = this.data.userInfo
      this.setData({
        "userInfo.nickName": nickName,
        hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
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
    }
  },
})
