import { formatTime } from '../../utils/util';

// 导入 TDesign 组件的实例方法
const Message = require('tdesign-miniprogram/message/index');
const Toast = require('tdesign-miniprogram/toast/index');

// 获取应用实例
const app = getApp<IAppOption>();

// 定义菜品类型
interface Dish {
  _id?: string;
  title: string;
  kind: string;
  description: string;
  price: number;
  imageUrl?: string;
  source?: string;
  selected?: boolean;
}

// 页面配置
Page({
  data: {
    // 当前激活的标签页
    activeTab: 'dishes',
    
    // 菜品数据相关
    dishes: [] as Dish[],
    total: 0,
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    
    // 选择状态
    selectAll: false,
    hasSelected: false,
    
    // 对话框相关
    dialogVisible: false,
    isEdit: false,
    formData: {
      _id: '',
      title: '',
      kind: '',
      description: '',
      price: 0,
      source: ''
    },
    
    // 权限检查
    isAdmin: false,
    isSuperAdmin: false
  },

  onLoad() {
    // 检查权限
    this.checkAdminStatus();
    
    // 加载菜品数据
    this.fetchDishes();
    
    // 确保对话框初始状态是关闭的
    this.setData({
      dialogVisible: false
    });
  },
  
  onShow() {
    // 每次显示页面时刷新数据
    this.checkAdminStatus();
    this.fetchDishes();
  },
  
  // 检查管理员权限
  checkAdminStatus() {
    // 判断是否是超级管理员
    const openid = app.globalData.openid || '';
    const isSuperAdmin = openid === 'opl2r7S45cPG_M11i00myZVX1wdc'; // 这里使用你的超级管理员openid
    
    this.setData({
      isAdmin: app.globalData.isAdmin || false,
      isSuperAdmin
    });
    
    // 如果既不是管理员也不是超级管理员，则返回个人中心页面
    if (!this.data.isAdmin && !this.data.isSuperAdmin) {
      wx.showToast({
        title: '权限不足',
        icon: 'none'
      });
      
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },
  
  // Tab 切换事件
  onTabChange(e: WechatMiniprogram.CustomEvent) {
    const value = e.detail.value;
    this.setData({
      activeTab: value
    });
    
    if (value === 'dishes') {
      this.fetchDishes();
    }
    // 如果有其他tab，可以在这里添加对应的数据加载逻辑
  },
  
  // 获取菜品列表数据
  async fetchDishes() {
    wx.showLoading({
      title: '加载中...'
    });
    
    try {
      const db = wx.cloud.database();
      const dishesCollection = db.collection('dishes');
      
      // 获取总数
      const countResult = await dishesCollection.count();
      const total = countResult.total;
      
      // 分页查询
      const { currentPage, pageSize } = this.data;
      const skip = (currentPage - 1) * pageSize;
      
      const result = await dishesCollection
        .skip(skip)
        .limit(pageSize)
        .get();
      
      const dishes = result.data.map((dish: any) => ({
        ...dish,
        selected: false
      }));
      
      // 计算总页数
      const totalPages = Math.ceil(total / pageSize) || 1;
      
      this.setData({
        dishes,
        total,
        totalPages,
        selectAll: false,
        hasSelected: false
      });
    } catch (error) {
      console.error('获取菜品列表失败:', error);
      Message.error({
        context: this,
        offset: [20, 32],
        content: '获取菜品列表失败'
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  // 刷新表格
  onRefreshTable() {
    this.fetchDishes();
  },
  
  // 上一页
  onPrevPage() {
    if (this.data.currentPage > 1) {
      this.setData({
        currentPage: this.data.currentPage - 1
      }, () => {
        this.fetchDishes();
      });
    }
  },
  
  // 下一页
  onNextPage() {
    if (this.data.currentPage < this.data.totalPages) {
      this.setData({
        currentPage: this.data.currentPage + 1
      }, () => {
        this.fetchDishes();
      });
    }
  },
  
  // 选择所有项
  onSelectAll() {
    const newSelectAll = !this.data.selectAll;
    const dishes = this.data.dishes.map(dish => ({
      ...dish,
      selected: newSelectAll
    }));
    
    this.setData({
      selectAll: newSelectAll,
      dishes,
      hasSelected: newSelectAll && dishes.length > 0
    });
  },
  
  // 选择单个项
  onSelectItem(e: WechatMiniprogram.CustomEvent) {
    const id = e.currentTarget.dataset.id;
    const dishes = this.data.dishes.map(dish => {
      if (dish._id === id) {
        return {
          ...dish,
          selected: !dish.selected
        };
      }
      return dish;
    });
    
    // 检查是否所有项都被选中
    const allSelected = dishes.length > 0 && dishes.every(dish => dish.selected);
    // 检查是否有选中的项
    const hasSelected = dishes.some(dish => dish.selected);
    
    this.setData({
      dishes,
      selectAll: allSelected,
      hasSelected
    });
  },
  
  // 添加新菜品
  onAddDish() {
    console.log('Add dish button clicked');
    wx.navigateTo({
      url: '/pages/edit-dish/edit-dish'
    });
  },
  
  // 查看菜品详情
  onViewDish(e: WechatMiniprogram.CustomEvent) {
    const id = e.currentTarget.dataset.id;
    const dish = this.data.dishes.find(item => item._id === id);
    
    if (dish) {
      wx.showModal({
        title: '菜品详情',
        content: `
名称: ${dish.title}
类别: ${dish.kind}
价格: ¥${dish.price}
描述: ${dish.description}
        `,
        showCancel: false
      });
    }
  },
  
  // 编辑菜品
  onEditDish(e: WechatMiniprogram.CustomEvent) {
    console.log('Edit dish clicked:', e.currentTarget.dataset.id);
    const id = e.currentTarget.dataset.id;
    
    if (id) {
      wx.navigateTo({
        url: `/pages/edit-dish/edit-dish?id=${id}&isEdit=true`
      });
    } else {
      console.log('Dish not found for editing');
    }
  },
  
  // 删除单个菜品
  onDeleteDish(e: WechatMiniprogram.CustomEvent) {
    const id = e.currentTarget.dataset.id;
    const title = this.data.dishes.find(item => item._id === id)?.title;
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除 "${title}" 吗？`,
      success: (res) => {
        if (res.confirm) {
          this.deleteDish(id);
        }
      }
    });
  },
  
  // 删除选中的菜品
  onDeleteSelected() {
    const selectedDishes = this.data.dishes.filter(dish => dish.selected);
    
    if (selectedDishes.length === 0) {
      return;
    }
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除选中的 ${selectedDishes.length} 个菜品吗？`,
      success: (res) => {
        if (res.confirm) {
          this.deleteMultipleDishes(selectedDishes.map(dish => dish._id as string));
        }
      }
    });
  },
  
  // 实际删除单个菜品的函数
  async deleteDish(id: string) {
    wx.showLoading({
      title: '删除中...'
    });
    
    try {
      const db = wx.cloud.database();
      await db.collection('dishes').doc(id).remove();
      
      Message.success({
        context: this,
        offset: [20, 32],
        content: '删除成功'
      });
      
      // 刷新数据
      this.fetchDishes();
    } catch (error) {
      console.error('删除菜品失败:', error);
      Message.error({
        context: this,
        offset: [20, 32],
        content: '删除失败'
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  // 批量删除菜品
  async deleteMultipleDishes(ids: string[]) {
    if (ids.length === 0) return;
    
    wx.showLoading({
      title: '批量删除中...'
    });
    
    try {
      // 批量删除需要在云函数中实现
      // 这里我们可以使用一个循环来简化代码
      const db = wx.cloud.database();
      const promises = ids.map(id => db.collection('dishes').doc(id).remove());
      
      await Promise.all(promises);
      
      Message.success({
        context: this,
        offset: [20, 32],
        content: '批量删除成功'
      });
      
      // 刷新数据
      this.fetchDishes();
    } catch (error) {
      console.error('批量删除菜品失败:', error);
      Message.error({
        context: this,
        offset: [20, 32],
        content: '批量删除失败'
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  // 导出菜品数据
  onExportDishes() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '小程序暂不支持导出功能',
      theme: 'warning'
    });
    
    // 注：微信小程序不支持直接导出文件，你可以考虑将数据发送到服务器然后提供一个下载链接
  },
  
  // 导入菜品数据
  onImportDishes() {
    Toast({
      context: this,
      selector: '#t-toast',
      message: '小程序暂不支持导入功能',
      theme: 'warning'
    });
    
    // 注：微信小程序不支持直接导入文件，你可以考虑通过服务器接收上传的文件
  },
  
  // 表单字段变更
  onTitleChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({
      'formData.title': e.detail.value || e.detail
    });
  },
  
  onKindChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({
      'formData.kind': e.detail.value || e.detail
    });
  },
  
  onPriceChange(e: WechatMiniprogram.CustomEvent) {
    const value = e.detail.value || e.detail;
    this.setData({
      'formData.price': Number(value)
    });
  },
  
  onDescriptionChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({
      'formData.description': e.detail.value || e.detail
    });
  },
  
  onSourceChange(e: WechatMiniprogram.CustomEvent) {
    this.setData({
      'formData.source': e.detail.value || e.detail
    });
  },
  
  // 确认对话框操作（新增或编辑）
  async onDialogConfirm() {
    const { isEdit, formData } = this.data;
    
    // 表单验证
    if (!formData.title.trim()) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请输入菜品名称',
        theme: 'error'
      });
      return;
    }
    
    if (!formData.kind.trim()) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请输入菜品类别',
        theme: 'error'
      });
      return;
    }
    
    if (isNaN(formData.price) || formData.price <= 0) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请输入有效的价格',
        theme: 'error'
      });
      return;
    }
    
    wx.showLoading({
      title: isEdit ? '更新中...' : '添加中...'
    });
    
    try {
      const db = wx.cloud.database();
      
      if (isEdit) {
        // 编辑现有菜品
        const { _id, ...updateData } = formData;
        await db.collection('dishes').doc(_id).update({
          data: updateData
        });
        
        Message.success({
          context: this,
          offset: [20, 32],
          content: '更新成功'
        });
      } else {
        // 添加新菜品
        await db.collection('dishes').add({
          data: {
            title: formData.title,
            kind: formData.kind,
            description: formData.description,
            price: formData.price,
            source: formData.source,
            createTime: new Date()
          }
        });
        
        Message.success({
          context: this,
          offset: [20, 32],
          content: '添加成功'
        });
      }
      
      // 关闭对话框并刷新数据
      this.setData({
        dialogVisible: false
      });
      this.fetchDishes();
    } catch (error) {
      console.error(isEdit ? '更新菜品失败:' : '添加菜品失败:', error);
      Message.error({
        context: this,
        offset: [20, 32],
        content: isEdit ? '更新失败' : '添加失败'
      });
    } finally {
      wx.hideLoading();
    }
  },
  
  // 取消对话框操作
  onDialogCancel() {
    this.setData({
      dialogVisible: false
    });
  }
}); 