// edit-dish.ts
const Message = require('tdesign-miniprogram/message/index');
const Toast = require('tdesign-miniprogram/toast/index');

// 定义菜品类型接口
interface Dish {
  _id?: string;
  title: string;
  kind: string;
  description: string;
  price: number;
  source?: string;
  createTime?: Date;
}

// 定义表单数据接口
interface FormData {
  _id: string;
  title: string;
  kind: string;
  description: string;
  price: number;
  source: string;
}

// 获取应用实例
const app = getApp<IAppOption>();

// 页面配置
Page({
  data: {
    isEdit: false,
    formData: {
      _id: '',
      title: '',
      description: '',
      kind: '',
      price: '',
      source: '',
    }
  },

  onLoad(options) {
    console.log('edit-dish onLoad', options);
    const { id, isEdit } = options;
    
    // 设置标题
    wx.setNavigationBarTitle({
      title: id ? '编辑菜品' : '新增菜品'
    });

    // 如果有id参数，则是编辑模式
    if (id) {
      this.setData({ 
        isEdit: true 
      });
      this.loadDishData(id);
    }
  },

  loadDishData(id: string) {
    console.log('加载菜品数据, id:', id);
    wx.showLoading({ title: '加载中...' });
    
    try {
      const db = wx.cloud.database();
      db.collection('dishes').doc(id).get().then(res => {
        console.log('获取菜品详情成功', res.data);
        if (res.data) {
          this.setData({
            formData: {
              _id: res.data._id ? String(res.data._id) : '',
              title: res.data.title || '',
              description: res.data.description || '',
              kind: res.data.kind || '',
              price: res.data.price ? res.data.price.toString() : '',
              source: res.data.source || ''
            }
          });
        }
      }).catch(err => {
        console.error('获取菜品详情失败', err);
        Message.error({
          context: this,
          offset: [20, 32],
          duration: 2000,
          content: '获取菜品详情失败'
        });
      }).finally(() => {
        wx.hideLoading();
      });
    } catch (error) {
      console.error('加载菜品数据错误:', error);
      wx.hideLoading();
    }
  },

  onTitleChange(e: any) {
    this.setData({
      'formData.title': e.detail.value
    });
  },

  onDescriptionChange(e: any) {
    this.setData({
      'formData.description': e.detail.value
    });
  },

  onKindChange(e: any) {
    this.setData({
      'formData.kind': e.detail.value
    });
  },

  onPriceChange(e: any) {
    this.setData({
      'formData.price': e.detail.value
    });
  },

  onSourceChange(e: any) {
    this.setData({
      'formData.source': e.detail.value
    });
  },

  validateForm() {
    const { title, price } = this.data.formData;
    if (!title.trim()) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请输入菜品名称',
        icon: '',
        duration: 2000
      });
      return false;
    }
    
    if (!price.trim()) {
      Toast({
        context: this,
        selector: '#t-toast',
        message: '请输入菜品价格',
        icon: '',
        duration: 2000
      });
      return false;
    }
    
    return true;
  },

  onSubmit() {
    console.log('提交表单', this.data.formData);
    
    if (!this.validateForm()) return;
    
    wx.showLoading({ title: '提交中...' });
    
    const db = wx.cloud.database();
    const { _id, title, description, kind, price, source } = this.data.formData;
    
    const data: any = {
      title,
      description,
      kind,
      price: parseFloat(price),
      source,
      updateTime: db.serverDate()
    };
    
    let promise;
    if (this.data.isEdit && _id) {
      // 更新
      promise = db.collection('dishes').doc(_id).update({
        data
      });
    } else {
      // 新增
      data.createTime = db.serverDate();
      promise = db.collection('dishes').add({
        data
      });
    }
    
    promise.then(res => {
      console.log('保存成功', res);
      Toast({
        context: this,
        selector: '#t-toast',
        message: '保存成功',
        icon: 'check-circle',
        duration: 1000,
        onClose: () => {
          wx.navigateBack();
        }
      });
    }).catch(err => {
      console.error('保存失败', err);
      Message.error({
        context: this,
        offset: [20, 32],
        duration: 2000,
        content: '保存失败'
      });
    }).finally(() => {
      wx.hideLoading();
    });
  },

  onCancel() {
    wx.navigateBack();
  }
}); 